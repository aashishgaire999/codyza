import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"
import { getRankFromXP } from "@/lib/ranks"

function unauthorized() {
  return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
}

async function setSubmissionStatus(id: string, status: "approved" | "rejected") {
  const service = createServiceSupabase()
  const { data: submission, error } = await service
    .from("submissions")
    .select("id,status,contributor_id,codyza_id,project_name,xp_earned,bounty_id")
    .eq("id", id)
    .maybeSingle()
  if (error || !submission) throw new Error(error?.message || "Submission not found")

  if (submission.status !== "pending") {
    throw new Error(`Submission was already ${submission.status}`)
  }

  const { data: updated, error: updateError } = await service.from("submissions").update({ status }).eq("id", id).eq("status", "pending").select("id").maybeSingle()
  if (updateError) throw new Error(updateError.message)
  if (!updated) throw new Error("Submission status changed. Refresh and try again.")

  if (status === "approved") {
    if (submission.bounty_id) {
      await service.from("bounties").update({ status: "completed" }).eq("id", submission.bounty_id).eq("claimed_by", submission.codyza_id).eq("status", "claimed")
    }

    const historyAction = `Approved submission:${submission.id}`
    const { data: priorAward } = await service
      .from("xp_history")
      .select("id")
      .eq("contributor_id", submission.contributor_id)
      .eq("action", historyAction)
      .maybeSingle()

    if (!priorAward && Number(submission.xp_earned) > 0) {
      const { data: contributor } = await service
        .from("contributors")
        .select("xp,streak,last_submission")
        .eq("id", submission.contributor_id)
        .maybeSingle()
      if (contributor) {
        const today = new Date().toISOString().slice(0, 10)
        const last = contributor.last_submission ? new Date(contributor.last_submission).getTime() : 0
        const inStreak = last > 0 && (Date.now() - last) / 86_400_000 <= 7
        const xp = Number(contributor.xp || 0) + Number(submission.xp_earned)
        await service.from("contributors").update({
          xp,
          rank: getRankFromXP(xp).name,
          streak: inStreak ? Number(contributor.streak || 0) + 1 : 1,
          last_submission: today,
        }).eq("id", submission.contributor_id)
        await service.from("xp_history").insert({
          contributor_id: submission.contributor_id,
          codyza_id: submission.codyza_id,
          action: historyAction,
          xp_change: Number(submission.xp_earned),
        })
      }
    }
  }

  await service.from("notifications").insert({
    codyza_id: submission.codyza_id,
    type: status === "approved" ? "submission_approved" : "submission_rejected",
    message: status === "approved"
      ? `Your project "${submission.project_name}" was approved! +${submission.xp_earned} XP added.`
      : `Your project "${submission.project_name}" was not approved this time.`,
    link: "/member/projects",
  })
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const service = createServiceSupabase()
  const [contributors, submissions, applications, groups, groupMembers, bounties, sessions] = await Promise.all([
    service.from("contributors").select("*").order("xp", { ascending: false }),
    service.from("submissions").select("*").order("submitted_at", { ascending: false }),
    service.from("applications").select("*").order("applied_at", { ascending: false }),
    service.from("project_groups").select("*").order("created_at", { ascending: false }),
    service.from("group_members").select("group_id,codyza_id,role"),
    service.from("bounties").select("*").order("posted_at", { ascending: false }),
    service.from("work_sessions").select("*").order("started_at", { ascending: false }),
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

  return NextResponse.json({
    contributors: people,
    submissions: submissions.data || [],
    applications: applications.data || [],
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
      await setSubmissionStatus(String(payload.id), status)
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
    } else {
      return NextResponse.json({ error: "Unknown admin action" }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
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
