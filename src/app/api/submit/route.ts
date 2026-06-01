import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { GoogleGenerativeAI } from "@google/generative-ai"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const RANK_NAMES = [
  { name: "Apprentice", minXP: 0 },
  { name: "Associate Engineer", minXP: 500 },
  { name: "Software Engineer", minXP: 1500 },
  { name: "Senior Engineer", minXP: 3500 },
  { name: "Staff Engineer", minXP: 7000 },
  { name: "Principal Engineer", minXP: 12000 },
  { name: "Distinguished Engineer", minXP: 20000 },
  { name: "Codyza Fellow", minXP: 35000 },
]

function getRank(xp: number) {
  for (let i = RANK_NAMES.length - 1; i >= 0; i--) {
    if (xp >= RANK_NAMES[i].minXP) return RANK_NAMES[i].name
  }
  return "Apprentice"
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { codyza_id, project_name, github_url, live_url, description, tech_stack } = body

    if (!codyza_id || !project_name || !github_url || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: contributor, error: fetchError } = await supabase
      .from("contributors")
      .select("*")
      .eq("codyza_id", codyza_id.toUpperCase())
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
    const new_total_xp = (contributor.xp || 0) + total_xp
    const new_rank = getRank(new_total_xp)
    const rank_up = new_rank !== contributor.rank

    await supabase.from("submissions").insert({
      contributor_id: contributor.id,
      codyza_id: codyza_id.toUpperCase(),
      project_name,
      github_url,
      live_url: live_url || null,
      description,
      tech_stack: tech_stack || [],
      ai_score,
      ai_feedback,
      ai_review,
      xp_earned: total_xp,
      status: "pending",
    })

    await supabase.from("contributors").update({
      xp: new_total_xp,
      rank: new_rank,
      streak: streak_new,
      last_submission: today,
    }).eq("codyza_id", codyza_id.toUpperCase())

    await supabase.from("xp_history").insert({
      contributor_id: contributor.id,
      codyza_id: codyza_id.toUpperCase(),
      action: `Submitted: ${project_name}`,
      xp_change: total_xp,
    })

    return NextResponse.json({
      success: true,
      contributor_name: contributor.name,
      ai_score,
      ai_feedback,
      ai_review,
      xp_breakdown: { base: base_xp, deploy: deploy_xp, quality: quality_xp, streak: streak_xp, total: total_xp },
      new_total_xp,
      new_rank,
      rank_up,
      streak: streak_new,
    })

  } catch (error) {
    console.error("Submit error:", error)
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 })
  }
}
