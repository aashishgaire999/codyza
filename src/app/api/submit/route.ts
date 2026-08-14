import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"
import { safeHttpsUrl } from "@/lib/security"
import { z } from "zod"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const submissionSchema = z.object({
  project_name: z.string().trim().min(2).max(180),
  github_url: z.string().max(500),
  live_url: z.string().max(500).optional().nullable(),
  description: z.string().trim().min(20).max(5000),
  tech_stack: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  bounty_id: z.string().max(100).optional().nullable(),
})

export async function POST(req: Request) {
  try {
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const parsedBody = submissionSchema.safeParse(await req.json())
    if (!parsedBody.success) return NextResponse.json({ error: "Check the project details and try again" }, { status: 400 })
    const { project_name, github_url: rawGithubUrl, live_url: rawLiveUrl, description, tech_stack, bounty_id } = parsedBody.data
    const github_url = safeHttpsUrl(rawGithubUrl, { githubRepository: true })
    const live_url = rawLiveUrl ? safeHttpsUrl(rawLiveUrl) : null
    if (!github_url) return NextResponse.json({ error: "Enter a valid HTTPS GitHub repository URL" }, { status: 400 })
    if (rawLiveUrl && !live_url) return NextResponse.json({ error: "Live URL must be a public HTTPS address" }, { status: 400 })

    const supabase = createServiceSupabase()
    const { data: contributor, error: fetchError } = await supabase
      .from("contributors")
      .select("*")
      .eq("id", member.id)
      .single()

    if (fetchError || !contributor) {
      return NextResponse.json({ error: "Invalid Codyza ID." }, { status: 404 })
    }

    if (bounty_id) {
      const { data: bounty } = await supabase.from("bounties").select("id").eq("id", bounty_id).eq("claimed_by", member.codyza_id).eq("status", "claimed").maybeSingle()
      if (!bounty) return NextResponse.json({ error: "That bounty is not assigned to you" }, { status: 403 })
    }

    let ai_score = 7
    let ai_feedback = "Project reviewed. Good work on the submission."
    let ai_review: Record<string, unknown> = {}

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
      const prompt = `You are a senior software engineer doing a thorough code review for Codyza, a developer community. A contributor submitted their project. Give an honest, detailed, constructive review. Be specific — reference the actual tech stack and project type.

PROJECT DETAILS:
- Name: ${project_name}
- GitHub: ${github_url}
- Live URL: ${live_url || "Not deployed"}
- Description: ${description}
- Tech Stack: ${tech_stack?.join(", ") || "Not specified"}

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

      const result = await model.generateContent(prompt)
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

    const base_xp = 100
    const deploy_xp = live_url ? 150 : 0
    // AI feedback is advisory only. Never let model output authorize XP.
    const quality_xp = 0

    const today = new Date().toISOString().split("T")[0]
    const lastSub = contributor.last_submission
    const isStreak = lastSub &&
      (new Date(today).getTime() - new Date(lastSub).getTime()) / (1000 * 60 * 60 * 24) <= 7
    const streak_new = isStreak ? (contributor.streak || 0) + 1 : 1
    const streak_xp = streak_new >= 4 ? 200 : streak_new >= 2 ? 50 : 0

    const total_xp = base_xp + deploy_xp + quality_xp + streak_xp
    const { error: insertError } = await supabase.from("submissions").insert({
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
      xp_earned: total_xp,
      status: "pending",
      bounty_id: bounty_id || null,
    })
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      contributor_name: contributor.name,
      ai_score,
      ai_feedback,
      ai_review,
      xp_breakdown: { base: base_xp, deploy: deploy_xp, quality: quality_xp, streak: streak_xp, total: total_xp },
      status: "pending",
    })

  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 })
  }
}
