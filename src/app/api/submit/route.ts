import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"
import { calculateProjectXp, projectSubmissionSchema } from "@/lib/project-submission"
import { consumeRateLimit, safeHttpsUrl } from "@/lib/security"

export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash"
// Leaves headroom under maxDuration for the DB lookup/insert around the AI call.
const REQUEST_BUDGET_MS = 27_000
const FETCH_TIMEOUT_MS = 4_500

function msRemaining(deadline: number, floor = 500) {
  return Math.max(floor, deadline - Date.now())
}

async function fetchWithTimeout(url: string, ms: number, init: RequestInit = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function stripHtml(html: string, maxLength: number) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.slice(0, maxLength)
}

function parseGithubRepo(url: string) {
  try {
    const [owner, repo] = new URL(url).pathname.split("/").filter(Boolean)
    return owner && repo ? { owner, repo: repo.replace(/\.git$/, "") } : null
  } catch {
    return null
  }
}

// Pulls real repo metadata + README so the review is grounded in the actual
// code, not just the submitter's self-description. Never throws -- a failed
// fetch (private repo, rate limit, timeout) just means less context, not a
// broken submission.
async function fetchGithubContext(githubUrl: string, timeoutMs: number) {
  const parsed = parseGithubRepo(githubUrl)
  if (!parsed) return null
  const { owner, repo } = parsed
  const headers = { "User-Agent": "codyza-review-bot", Accept: "application/vnd.github+json" }
  try {
    const [repoRes, readmeRes] = await Promise.allSettled([
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`, timeoutMs, { headers }),
      fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/readme`, timeoutMs, {
        headers: { ...headers, Accept: "application/vnd.github.raw+json" },
      }),
    ])
    let summary = ""
    if (repoRes.status === "fulfilled" && repoRes.value.ok) {
      const data = await repoRes.value.json()
      summary += `Repository: ${data.full_name}\nDescription: ${data.description || "none given"}\nPrimary language: ${data.language || "unknown"}\nStars: ${data.stargazers_count}\n\n`
    }
    if (readmeRes.status === "fulfilled" && readmeRes.value.ok) {
      summary += `README:\n${(await readmeRes.value.text()).slice(0, 3000)}`
    }
    return summary.trim() || null
  } catch {
    return null
  }
}

// Fetches the rendered page's raw HTML (title, meta description, visible
// text) so the review reflects what actually ships, not just claims.
async function fetchLiveSiteContext(liveUrl: string, timeoutMs: number) {
  try {
    const res = await fetchWithTimeout(liveUrl, timeoutMs, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CodyzaReviewBot/1.0)" },
    })
    if (!res.ok) return null
    const html = await res.text()
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim()
    const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]?.trim()
    return [
      title && `Page title: ${title}`,
      description && `Meta description: ${description}`,
      `Visible page content: ${stripHtml(html, 2500)}`,
    ].filter(Boolean).join("\n")
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  try {
    const rateLimit = consumeRateLimit(req, "project-submit", 10, 60 * 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
      )
    }

    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const parsedBody = projectSubmissionSchema.safeParse(await req.json())
    if (!parsedBody.success) {
      const fieldMessages: Record<string, string> = {
        project_name: "Project name must be between 2 and 180 characters",
        description: "Description must be between 20 and 5000 characters",
        github_url: "Enter a GitHub repository URL",
        live_url: "Live URL is too long",
        tech_stack: "Choose up to 30 tech stack tags",
      }
      const field = String(parsedBody.error.issues[0]?.path[0] ?? "")
      return NextResponse.json({ error: fieldMessages[field] || "Check the project details and try again" }, { status: 400 })
    }
    const { project_name, github_url: rawGithubUrl, live_url: rawLiveUrl, description, tech_stack } = parsedBody.data
    const github_url = safeHttpsUrl(rawGithubUrl, { githubRepository: true })
    const live_url = rawLiveUrl ? safeHttpsUrl(rawLiveUrl) : null
    if (!github_url) return NextResponse.json({ error: "Enter a valid HTTPS GitHub repository URL" }, { status: 400 })
    if (rawLiveUrl && !live_url) return NextResponse.json({ error: "Live URL must be a public HTTPS address" }, { status: 400 })

    const deadline = Date.now() + REQUEST_BUDGET_MS
    const supabase = createServiceSupabase()
    const [{ data: contributor, error: fetchError }, githubContext, liveSiteContext] = await Promise.all([
      supabase.from("contributors").select("*").eq("id", member.id).single(),
      fetchGithubContext(github_url, Math.min(FETCH_TIMEOUT_MS, msRemaining(deadline))),
      live_url ? fetchLiveSiteContext(live_url, Math.min(FETCH_TIMEOUT_MS, msRemaining(deadline))) : Promise.resolve(null),
    ])

    if (fetchError || !contributor) {
      return NextResponse.json({ error: "Invalid Codyza ID." }, { status: 404 })
    }

    let ai_score = 7
    let ai_feedback = "AI review unavailable for this submission — please evaluate it manually."
    let ai_review: Record<string, unknown> = {}

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
      const prompt = `You are a senior software engineer doing a thorough code review for Codyza, a developer community. A contributor submitted their project. Give an honest, detailed, constructive review grounded in the ACTUAL repository content and live site content below — not just the submitter's own description. If that context is missing or thin, say so in your feedback instead of inventing specifics you can't verify.

PROJECT DETAILS:
- Name: ${project_name}
- GitHub: ${github_url}
- Live URL: ${live_url || "Not deployed"}
- Submitter's description: ${description}
- Claimed tech stack: ${tech_stack?.join(", ") || "Not specified"}

ACTUAL REPOSITORY CONTENT (fetched from GitHub):
${githubContext || "Could not be fetched (private repo, rate limited, or unreachable)."}

ACTUAL LIVE SITE CONTENT (fetched from the live URL):
${liveSiteContext || (live_url ? "Could not be fetched (unreachable or blocked)." : "No live URL was provided.")}

Base your strengths, improvements, and roadmap on what you can actually see above. Be specific about what's missing or could be better — call out real gaps (missing tests, no error handling, thin README, unclear structure, accessibility issues, etc.) rather than generic advice.

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "score": <integer 1-10>,
  "summary": "<2-3 sentences: what the project is and what it does>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific issue 1>", "<specific issue 2>", "<specific issue 3>"],
  "roadmap": ["<top priority next step>", "<second priority>", "<third priority>"],
  "xp_breakdown": { "code_quality": <0-40>, "originality": <0-35>, "completeness": <0-25>, "documentation": <0-20> },
  "references": ["<open source project or resource to study, with brief why>", "<reference 2>"],
  "one_liner": "<one punchy sentence capturing the project potential>",
  "feedback": "<2-3 sentence honest overall summary for the contributor>"
}

Score: 1-4 needs major work, 5-6 decent start, 7-8 solid, 9 excellent, 10 exceptional.`

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("AI review timed out")), msRemaining(deadline))),
      ])
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        ai_score = Math.min(10, Math.max(1, Math.round(Number(parsed.score) || 7)))
        ai_feedback = typeof parsed.feedback === "string" ? parsed.feedback.slice(0, 2000) : ai_feedback
        ai_review = typeof parsed === "object" && parsed ? parsed : {}
      }
    } catch (e) {
      console.log("AI review error:", e)
    }

    // XP is calculated now for admin review, but is only added to the member
    // by admin_review_submission after an admin approves the project.
    const xp = calculateProjectXp({
      hasLiveUrl: Boolean(live_url),
      lastSubmission: contributor.last_submission,
      currentStreak: contributor.streak,
    })
    const submission = {
      contributor_id: contributor.id,
      codyza_id: contributor.codyza_id,
      project_name: String(project_name).slice(0, 180),
      github_url,
      live_url,
      description: String(description).slice(0, 5000),
      tech_stack: Array.isArray(tech_stack) ? tech_stack.slice(0, 30) : [],
      ai_score,
      ai_feedback,
      ai_review,
      xp_earned: xp.total,
      status: "pending",
    }
    const { error: insertError } = await supabase.from("submissions").insert(submission)
    if (insertError) {
      console.error("submission insert failed", { code: insertError.code, message: insertError.message })
      return NextResponse.json({
        error: "We could not save your project. Please try again shortly.",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      contributor_name: contributor.name,
      ai_score,
      ai_feedback,
      ai_review,
      xp_breakdown: xp,
      status: "pending",
    })

  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 })
  }
}
