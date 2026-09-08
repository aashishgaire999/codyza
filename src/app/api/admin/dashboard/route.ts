import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"
import { expireStaleWorkSessions, MAX_SESSION_MINUTES } from "@/lib/work-sessions"

function unauthorized() {
  return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
}

async function setSubmissionStatus(id: string, status: "approved" | "rejected", reason?: string) {
  const service = createServiceSupabase()
  const { error } = await service.rpc("admin_review_submission", {
    p_submission_id: id,
    p_status: status,
    p_reason: reason?.trim() ? reason.trim().slice(0, 1000) : null,
  })
  if (error) {
    console.error("Submission review failed", { code: error.code, message: error.message, details: error.details })
    if (error.code === "PGRST202") throw new Error("The submission workflow migration has not been installed yet")
    throw new Error(error.message)
  }
}

async function clockInMember(codyzaId: string, label?: string) {
  const service = createServiceSupabase()
  const { data: member, error: memberError } = await service
    .from("contributors")
    .select("id, codyza_id")
    .eq("codyza_id", codyzaId)
    .maybeSingle()
  if (memberError) throw new Error(memberError.message)
  if (!member) throw new Error("Contributor not found")

  const { data: active, error: activeError } = await service
    .from("work_sessions")
    .select("id")
    .eq("contributor_id", member.id)
    .eq("status", "active")
    .maybeSingle()
  if (activeError) throw new Error(activeError.message)
  if (active) throw new Error("This member is already clocked in")

  const cleanLabel = typeof label === "string" ? label.trim().slice(0, 160) : ""
  const { error } = await service.from("work_sessions").insert({
    contributor_id: member.id,
    codyza_id: member.codyza_id,
    label: cleanLabel ? `Clocked in by admin · ${cleanLabel}` : "Clocked in by admin",
    status: "active",
  })
  if (error) throw new Error(error.message)
}

async function clockOutSession(id: string, summary?: string, isFinished?: boolean) {
  const service = createServiceSupabase()
  const { data: session, error: sessionError } = await service
    .from("work_sessions")
    .select("started_at, status")
    .eq("id", id)
    .maybeSingle()
  if (sessionError) throw new Error(sessionError.message)
  if (!session) throw new Error("Session not found")
  if (session.status !== "active") throw new Error("Session is not active")

  const startedAt = new Date(session.started_at).getTime()
  const duration_minutes = Math.min(MAX_SESSION_MINUTES, Math.max(1, Math.round((Date.now() - startedAt) / (1000 * 60))))
  const cleanSummary = typeof summary === "string" && summary.trim() ? summary.trim().slice(0, 2000) : "Clocked out by admin"

  const { error } = await service
    .from("work_sessions")
    .update({
      ended_at: new Date().toISOString(),
      duration_minutes,
      summary: cleanSummary,
      is_finished: typeof isFinished === "boolean" ? isFinished : true,
      status: "completed",
      edited_by_admin: true,
    })
    .eq("id", id)
    .eq("status", "active")
  if (error) throw new Error(error.message)
}

// Corrects an existing session's recorded times/notes -- e.g. fixing a
// pre-cap 38h "completed" session down to a believable duration. Changing
// ended_at on a still-active session is refused; use clockOutSession (the
// "Clock out" action) to actually end an active session, since that path
// also satisfies the completed_session_fields DB constraint.
async function editSession(id: string, updates: Record<string, unknown>) {
  const service = createServiceSupabase()
  const { data: session, error: sessionError } = await service
    .from("work_sessions")
    .select("started_at, ended_at, status")
    .eq("id", id)
    .maybeSingle()
  if (sessionError) throw new Error(sessionError.message)
  if (!session) throw new Error("Session not found")
  if (updates.ended_at !== undefined && session.status !== "completed") {
    throw new Error("Clock this session out first, then edit its end time")
  }

  const startedAt = typeof updates.started_at === "string" && updates.started_at ? new Date(updates.started_at) : new Date(session.started_at)
  const endedAt = updates.ended_at !== undefined
    ? (typeof updates.ended_at === "string" && updates.ended_at ? new Date(updates.ended_at) : null)
    : (session.ended_at ? new Date(session.ended_at) : null)

  if (Number.isNaN(startedAt.getTime())) throw new Error("Invalid start time")
  if (endedAt && Number.isNaN(endedAt.getTime())) throw new Error("Invalid end time")
  if (endedAt && endedAt.getTime() <= startedAt.getTime()) throw new Error("End time must be after start time")

  const patch: Record<string, unknown> = { started_at: startedAt.toISOString(), edited_by_admin: true }
  if (endedAt) {
    patch.ended_at = endedAt.toISOString()
    patch.duration_minutes = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60)))
  }
  if (typeof updates.summary === "string") patch.summary = updates.summary.trim().slice(0, 2000) || null
  if (typeof updates.label === "string") patch.label = updates.label.trim().slice(0, 160) || null
  if (typeof updates.is_finished === "boolean") patch.is_finished = updates.is_finished

  const { error } = await service.from("work_sessions").update(patch).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const service = createServiceSupabase()
  await expireStaleWorkSessions(service)
  const [contributors, submissions, applications, groups, groupMembers, bounties, sessions, authUsers] = await Promise.all([
    service.from("contributors").select("*").order("xp", { ascending: false }),
    service.from("submissions").select("*").order("submitted_at", { ascending: false }),
    service.from("applications").select("*").order("applied_at", { ascending: false }),
    service.from("project_groups").select("*").order("created_at", { ascending: false }),
    service.from("group_members").select("group_id,codyza_id,role"),
    service.from("bounties").select("*").order("posted_at", { ascending: false }),
    service.from("work_sessions").select("*").order("started_at", { ascending: false }),
    service.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])
  const failed = [contributors, submissions, applications, groups, groupMembers, bounties].find((result) => result.error)
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })

  // Work sessions were introduced after the original Codyza schema. Keep the
  // rest of the admin dashboard available when that optional migration has not
  // been applied yet; the sessions panel will simply be empty.
  const workSessions = sessions.error?.code === "PGRST205" ? [] : sessions.data || []
  if (sessions.error && sessions.error.code !== "PGRST205") {
    return NextResponse.json({ error: sessions.error.message }, { status: 500 })
  }

  const people = contributors.data || []
  const names = new Map(people.map((person) => [person.codyza_id, person.name]))
  const membersByGroup = new Map<string, Array<Record<string, unknown>>>()
  for (const member of groupMembers.data || []) {
    const entries = membersByGroup.get(member.group_id) || []
    entries.push({ ...member, name: names.get(member.codyza_id) || member.codyza_id })
    membersByGroup.set(member.group_id, entries)
  }

  // Lets admins confirm an approved applicant actually made it into the
  // system (and when they were last active) without checking Supabase by
  // hand -- cross-referenced by email since that's the only link between an
  // application, its auth account, and its eventual contributor row.
  const contributorByEmail = new Map(people.filter((p) => p.email).map((p) => [String(p.email).toLowerCase(), p]))
  const authByEmail = new Map(
    (authUsers.data?.users || [])
      .filter((u) => u.email)
      .map((u) => [String(u.email).toLowerCase(), { confirmed_at: u.confirmed_at || null, last_sign_in_at: u.last_sign_in_at || null }]),
  )
  // So admins can see a group submission awards XP to every member, not just
  // the person who happened to submit it, before they approve it.
  const groupsById = new Map((groups.data || []).map((group) => [group.id, group]))
  const enrichedSubmissions = (submissions.data || []).map((sub) => {
    const group = sub.group_id ? groupsById.get(sub.group_id) : undefined
    return {
      ...sub,
      group: group ? { id: group.id, name: group.name, member_count: (membersByGroup.get(group.id) || []).length } : null,
    }
  })

  const enrichedApplications = (applications.data || []).map((app) => {
    const email = app.email ? String(app.email).toLowerCase() : ""
    const member = email ? contributorByEmail.get(email) : undefined
    const auth = email ? authByEmail.get(email) : undefined
    return {
      ...app,
      member: member ? { codyza_id: member.codyza_id, name: member.name, avatar_url: member.avatar_url } : null,
      confirmed_at: auth?.confirmed_at || null,
      last_sign_in_at: auth?.last_sign_in_at || null,
    }
  })

  return NextResponse.json({
    contributors: people,
    submissions: enrichedSubmissions,
    applications: enrichedApplications,
    groups: (groups.data || []).map((group) => ({ ...group, members: membersByGroup.get(group.id) || [], creator_name: names.get(group.created_by) || group.created_by })),
    bounties: (bounties.data || []).map((bounty) => ({ ...bounty, poster_name: names.get(bounty.posted_by) || bounty.posted_by, claimer_name: bounty.claimed_by ? names.get(bounty.claimed_by) || bounty.claimed_by : null })),
    workSessions: workSessions.map((session) => ({ ...session, member_name: names.get(session.codyza_id) || session.codyza_id })),
  })
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  try {
    const { action, payload = {} } = await request.json() as { action?: string; payload?: Record<string, unknown> }
    const service = createServiceSupabase()
    if (action === "submission_status") {
      const status = payload.status === "approved" ? "approved" : payload.status === "rejected" ? "rejected" : null
      if (!payload.id || !status) return NextResponse.json({ error: "Invalid submission update" }, { status: 400 })
      await setSubmissionStatus(String(payload.id), status, typeof payload.reason === "string" ? payload.reason : undefined)
    } else if (action === "bulk_submission_status") {
      const ids = Array.isArray(payload.ids) ? payload.ids.map(String).slice(0, 100) : []
      const status = payload.status === "approved" ? "approved" : payload.status === "rejected" ? "rejected" : null
      if (!ids.length || !status) return NextResponse.json({ error: "Invalid bulk update" }, { status: 400 })
      for (const id of ids) await setSubmissionStatus(id, status)
    } else if (action === "contributor_update") {
      if (!payload.id || typeof payload.updates !== "object" || !payload.updates) return NextResponse.json({ error: "Invalid contributor update" }, { status: 400 })
      const allowed = ["name", "email", "github", "role", "level", "xp", "rank", "streak"]
      const updates = Object.fromEntries(Object.entries(payload.updates as Record<string, unknown>).filter(([key]) => allowed.includes(key)))
      const { error } = await service.from("contributors").update(updates).eq("id", String(payload.id))
      if (error) throw new Error(error.message)
    } else if (action === "session_clock_in") {
      if (typeof payload.codyza_id !== "string" || !payload.codyza_id) return NextResponse.json({ error: "Contributor is required" }, { status: 400 })
      await clockInMember(payload.codyza_id, typeof payload.label === "string" ? payload.label : undefined)
    } else if (action === "session_clock_out") {
      if (typeof payload.id !== "string" || !payload.id) return NextResponse.json({ error: "Session is required" }, { status: 400 })
      await clockOutSession(payload.id, typeof payload.summary === "string" ? payload.summary : undefined, typeof payload.is_finished === "boolean" ? payload.is_finished : undefined)
    } else if (action === "session_edit") {
      if (typeof payload.id !== "string" || !payload.id) return NextResponse.json({ error: "Session is required" }, { status: 400 })
      await editSession(payload.id, payload)
    } else {
      return NextResponse.json({ error: "Unknown admin action" }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin dashboard action failed", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin action failed" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const { entity, id } = await request.json() as { entity?: "submission" | "contributor"; id?: string }
  if (!entity || !id) return NextResponse.json({ error: "Entity and id are required" }, { status: 400 })
  const service = createServiceSupabase()
  if (entity === "submission") {
    const { error } = await service.from("submissions").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (entity === "contributor") {
    const { data: contributor } = await service.from("contributors").select("codyza_id").eq("id", id).maybeSingle()
    if (!contributor) return NextResponse.json({ error: "Contributor not found" }, { status: 404 })
    await service.from("submissions").delete().eq("codyza_id", contributor.codyza_id)
    const { error } = await service.from("contributors").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
