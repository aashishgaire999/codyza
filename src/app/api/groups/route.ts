import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

// GET all groups
export async function GET(req: Request) {
  const member = await getRequestMember(req)
  if (!member && !isAdminRequest(req)) return NextResponse.json({ error: "Sign-in required" }, { status: 401 })
  const supabase = createServiceSupabase()
  const { data: groups, error } = await supabase
    .from("project_groups")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get members for each group
  const groupIds = (groups || []).map((g: any) => g.id)
  const { data: members } = await supabase
    .from("group_members")
    .select("group_id, codyza_id, role")
    .in("group_id", groupIds.length > 0 ? groupIds : ["none"])

  const { data: contributors } = await supabase
    .from("contributors")
    .select("codyza_id, name")

  const nameMap = new Map((contributors || []).map((c: any) => [c.codyza_id, c.name]))
  const membersByGroup = new Map<string, any[]>()
  for (const m of members || []) {
    if (!membersByGroup.has(m.group_id)) membersByGroup.set(m.group_id, [])
    membersByGroup.get(m.group_id)!.push({ ...m, name: nameMap.get(m.codyza_id) || m.codyza_id })
  }

  const enriched = (groups || []).map((g: any) => ({
    ...g,
    members: membersByGroup.get(g.id) || [],
    creator_name: nameMap.get(g.created_by) || g.created_by,
  }))

  return NextResponse.json(enriched)
}

// POST create group (admin only)
export async function POST(req: Request) {
  try {
    if (!isAdminRequest(req)) return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
    const body = await req.json()
    const { name, description, member_ids, roles } = body

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }
    const supabase = createServiceSupabase()
    const { data: admin } = await supabase
      .from("contributors")
      .select("codyza_id")
      .eq("is_admin", true)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    if (!admin) return NextResponse.json({ error: "No admin contributor profile configured" }, { status: 409 })

    // Create group
    const { data: group, error: groupErr } = await supabase
      .from("project_groups")
      .insert({ name: String(name).slice(0, 160), description: String(description || "").slice(0, 3000), created_by: admin.codyza_id, status: "planning" })
      .select()
      .single()

    if (groupErr) return NextResponse.json({ error: groupErr.message }, { status: 500 })

    // Add members
    if (member_ids?.length > 0) {
      const memberRows = member_ids.map((id: string, i: number) => ({
        group_id: group.id,
        codyza_id: id,
        role: roles?.[i] || "member",
      }))
      await supabase.from("group_members").insert(memberRows)

      // Send notification to each member
      const notifications = member_ids.map((id: string) => ({
        codyza_id: id,
        message: `You've been added to project group "${name}"`,
        type: "group",
        link: `/member/groups`,
      }))
      await supabase.from("notifications").insert(notifications)
    }

    return NextResponse.json({ success: true, group })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
