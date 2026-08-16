import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

const MAX_LABEL_LENGTH = 160
const MAX_SUMMARY_LENGTH = 2000

function workSessionError(operation: string, error: { code?: string; message?: string }) {
  console.error("work_sessions operation failed", {
    operation,
    code: error.code || "unknown",
    message: error.message || "Unknown database error",
  })
  const unavailable = error.code === "42501" || error.message?.toLowerCase().includes("row-level security")
  return NextResponse.json(
    { error: unavailable ? "Time tracking is temporarily unavailable. Please try again shortly." : "Could not save your work session. Please try again." },
    { status: unavailable ? 503 : 500 },
  )
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return ""
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength)
}

// GET a member's own work sessions
export async function GET(req: Request) {
  const member = await getRequestMember(req)
  if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })

  const { data, error } = await createServiceSupabase()
    .from("work_sessions")
    .select("*")
    .eq("contributor_id", member.id)
    .order("started_at", { ascending: false })

  if (error) return workSessionError("list", error)

  return NextResponse.json(data)
}

// POST clock in
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const bountyId = typeof body.bounty_id === "string" && body.bounty_id ? body.bounty_id : null
    const groupId = typeof body.group_id === "string" && body.group_id ? body.group_id : null
    const category = body.category === "working"
      ? "Working"
      : body.category === "learning"
        ? "Learning"
        : ""
    if (body.category !== undefined && !category) {
      return NextResponse.json({ error: "Choose Working or Learning" }, { status: 400 })
    }
    const description = cleanText(body.label, MAX_LABEL_LENGTH)
    const label = cleanText([category, description].filter(Boolean).join(" · "), MAX_LABEL_LENGTH) || null
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const supabase = createServiceSupabase()

    if (bountyId && groupId) {
      return NextResponse.json({ error: "Choose either a bounty or a group" }, { status: 400 })
    }

    if (bountyId) {
      const { data: bounty, error: bountyError } = await supabase
        .from("bounties")
        .select("id")
        .eq("id", bountyId)
        .eq("claimed_by", member.codyza_id)
        .eq("status", "claimed")
        .maybeSingle()
      if (bountyError) return workSessionError("verify-bounty", bountyError)
      if (!bounty) return NextResponse.json({ error: "That bounty is not assigned to you" }, { status: 403 })
    }

    if (groupId) {
      const { data: membership, error: membershipError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("group_id", groupId)
        .eq("codyza_id", member.codyza_id)
        .maybeSingle()
      if (membershipError) return workSessionError("verify-group", membershipError)
      if (!membership) return NextResponse.json({ error: "You are not a member of that group" }, { status: 403 })
    }

    const { data: active, error: activeError } = await supabase
      .from("work_sessions")
      .select("id")
      .eq("contributor_id", member.id)
      .eq("status", "active")
      .maybeSingle()

    if (activeError) return workSessionError("find-active", activeError)

    if (active) {
      return NextResponse.json({ error: "Already clocked in" }, { status: 400 })
    }

    const { data: session, error } = await supabase
      .from("work_sessions")
      .insert({
        contributor_id: member.id,
        codyza_id: member.codyza_id,
        bounty_id: bountyId,
        group_id: groupId,
        label,
        status: "active",
      })
      .select()
      .single()

    if (error) return workSessionError("clock-in", error)

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error("work_sessions clock-in request failed", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH clock out
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { session_id, action } = body
    const summary = cleanText(body.summary, MAX_SUMMARY_LENGTH)
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const supabase = createServiceSupabase()

    if (action === "clock_out") {
      if (typeof session_id !== "string" || !session_id) {
        return NextResponse.json({ error: "Session is required" }, { status: 400 })
      }

      const { data: session, error: sessionError } = await supabase
        .from("work_sessions")
        .select("started_at, status, contributor_id")
        .eq("id", session_id)
        .maybeSingle()

      if (sessionError) return workSessionError("find-session", sessionError)

      if (!session || session.status !== "active" || session.contributor_id !== member.id) {
        return NextResponse.json({ error: "Session is not active" }, { status: 400 })
      }

      if (summary.length < 3) {
        return NextResponse.json({ error: "Add a short summary before clocking out" }, { status: 400 })
      }

      if (typeof body.done !== "boolean") {
        return NextResponse.json({ error: "Select whether you're done before clocking out" }, { status: 400 })
      }

      const startedAt = new Date(session.started_at).getTime()
      const duration_minutes = Math.max(1, Math.round((Date.now() - startedAt) / (1000 * 60)))

      const { data: completed, error: updateError } = await supabase
        .from("work_sessions")
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes,
          summary,
          is_finished: body.done,
          status: "completed",
        })
        .eq("id", session_id)
        .eq("contributor_id", member.id)
        .eq("status", "active")
        .select("id")
        .maybeSingle()

      if (updateError) return workSessionError("clock-out", updateError)
      if (!completed) return NextResponse.json({ error: "Session was already closed" }, { status: 409 })

      return NextResponse.json({ success: true, duration_minutes })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("work_sessions request failed", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
