import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"
import { notifyAllMembers } from "@/lib/member-notifications"

// GET all bounties
export async function GET(req: Request) {
  const member = await getRequestMember(req)
  if (!member && !isAdminRequest(req)) return NextResponse.json({ error: "Sign-in required" }, { status: 401 })
  const supabase = createServiceSupabase()
  const { data: bounties, error } = await supabase
    .from("bounties")
    .select("*")
    .order("posted_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: contributors } = await supabase
    .from("contributors")
    .select("codyza_id, name")

  const nameMap = new Map((contributors || []).map((c: any) => [c.codyza_id, c.name]))

  const enriched = (bounties || []).map((b: any) => ({
    ...b,
    poster_name: nameMap.get(b.posted_by) || b.posted_by,
    claimer_name: b.claimed_by ? nameMap.get(b.claimed_by) || b.claimed_by : null,
  }))

  return NextResponse.json(enriched)
}

// POST create bounty (admin only)
export async function POST(req: Request) {
  try {
    if (!isAdminRequest(req)) return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
    const body = await req.json()
    const { title, description, xp_reward, tech_tags } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 })
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

    const { data: bounty, error: bountyErr } = await supabase
      .from("bounties")
      .insert({ title: String(title).slice(0, 160), description: String(description).slice(0, 3000), xp_reward: Math.min(5000, Math.max(1, Number(xp_reward) || 100)), tech_tags: Array.isArray(tech_tags) ? tech_tags.slice(0, 20) : [], posted_by: admin.codyza_id, status: "open" })
      .select()
      .single()

    if (bountyErr) return NextResponse.json({ error: bountyErr.message }, { status: 500 })

    await notifyAllMembers({ type: "bounty", message: `New bounty: "${title}" — +${xp_reward || 100} XP`, link: "/member/bounties" })

    return NextResponse.json({ success: true, bounty })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH claim a bounty
export async function PATCH(req: Request) {
  try {
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const body = await req.json()
    const { bounty_id, action } = body
    const supabase = createServiceSupabase()

    if (action === "claim") {
      const { data: bounty, error } = await supabase
        .from("bounties")
        .update({ status: "claimed", claimed_by: member.codyza_id, claimed_at: new Date().toISOString() })
        .eq("id", bounty_id)
        .eq("status", "open")
        .select("id")
        .maybeSingle()

      if (error || !bounty) {
        return NextResponse.json({ error: "Bounty is no longer available" }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
