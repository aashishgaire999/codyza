import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const body = await req.json()
    const { project_name, github_url, live_url, description, tech_stack, bounty_id } = body

    if (!project_name || !github_url || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServiceSupabase()
    const { data: contributor, error: fetchError } = await supabase
      .from("contributors")
      .select("*")
      .eq("id", member.id)
      .single()

    if (fetchError || !contributor) {
      return NextResponse.json({ error: "Invalid Codyza ID." }, { status: 404 })
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
        ai_score = parsed.score || 7
        ai_feedback = parsed.feedback || ai_feedback
        ai_review = parsed
      }
    } catch (e) {
      console.log("AI review error:", e)
    }

    const base_xp = 100
    const deploy_xp = live_url ? 150 : 0
    const quality_xp = ai_score >= 8 ? (ai_score === 10 ? 300 : ai_score === 9 ? 200 : 100) : 0

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
      github_url: String(github_url).slice(0, 500),
      live_url: live_url ? String(live_url).slice(0, 500) : null,
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
