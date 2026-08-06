import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET a member's own work sessions
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const codyza_id = searchParams.get("codyza_id")

  if (!codyza_id) {
    return NextResponse.json({ error: "codyza_id is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("codyza_id", codyza_id)
    .order("started_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

// POST clock in
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { codyza_id, bounty_id, group_id, label } = body

    if (!codyza_id) {
      return NextResponse.json({ error: "codyza_id is required" }, { status: 400 })
    }

    const { data: contributor } = await supabase
      .from("contributors")
      .select("id")
      .eq("codyza_id", codyza_id)
      .maybeSingle()

    if (!contributor) {
      return NextResponse.json({ error: "Invalid Codyza ID." }, { status: 404 })
    }

    const { data: active } = await supabase
      .from("work_sessions")
      .select("id")
      .eq("codyza_id", codyza_id)
      .eq("status", "active")
      .maybeSingle()

    if (active) {
      return NextResponse.json({ error: "Already clocked in" }, { status: 400 })
    }

    const { data: session, error } = await supabase
      .from("work_sessions")
      .insert({
        contributor_id: contributor.id,
        codyza_id,
        bounty_id: bounty_id || null,
        group_id: group_id || null,
        label: label || null,
        status: "active",
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, session })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH clock out
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { session_id, action, summary } = body

    if (action === "clock_out") {
      const { data: session } = await supabase
        .from("work_sessions")
        .select("started_at, status")
        .eq("id", session_id)
        .maybeSingle()

      if (!session || session.status !== "active") {
        return NextResponse.json({ error: "Session is not active" }, { status: 400 })
      }

      if (!summary) {
        return NextResponse.json({ error: "Summary is required to clock out" }, { status: 400 })
      }

      const startedAt = new Date(session.started_at).getTime()
      const duration_minutes = Math.max(1, Math.round((Date.now() - startedAt) / (1000 * 60)))

      await supabase
        .from("work_sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes,
          summary,
          status: "completed",
        })
        .eq("id", session_id)

      return NextResponse.json({ success: true, duration_minutes })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
