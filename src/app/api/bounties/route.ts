import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET all bounties
export async function GET() {
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
    const body = await req.json()
    const { title, description, xp_reward, tech_tags, posted_by } = body

    if (!title || !description || !posted_by) {
      return NextResponse.json({ error: "Title, description and poster required" }, { status: 400 })
    }

    // Verify admin
    const { data: admin } = await supabase
      .from("contributors")
      .select("is_admin")
      .eq("codyza_id", posted_by)
      .maybeSingle()

    if (!admin?.is_admin) {
      return NextResponse.json({ error: "Only admins can post bounties" }, { status: 403 })
    }

    const { data: bounty, error: bountyErr } = await supabase
      .from("bounties")
      .insert({ title, description, xp_reward: xp_reward || 100, tech_tags: tech_tags || [], posted_by, status: "open" })
      .select()
      .single()

    if (bountyErr) return NextResponse.json({ error: bountyErr.message }, { status: 500 })

    // Notify all contributors
    const { data: allContribs } = await supabase
      .from("contributors")
      .select("codyza_id")

    if (allContribs?.length) {
      const notifications = allContribs.map((c: any) => ({
        codyza_id: c.codyza_id,
        message: `New bounty: "${title}" — +${xp_reward || 100} XP`,
        type: "bounty",
        link: "/member/bounties",
      }))
      await supabase.from("notifications").insert(notifications)
    }

    return NextResponse.json({ success: true, bounty })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH claim a bounty
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { bounty_id, codyza_id, action } = body

    if (action === "claim") {
      const { data: bounty } = await supabase
        .from("bounties")
        .select("status, title")
        .eq("id", bounty_id)
        .maybeSingle()

      if (bounty?.status !== "open") {
        return NextResponse.json({ error: "Bounty is no longer available" }, { status: 400 })
      }

      await supabase
        .from("bounties")
        .update({ status: "claimed", claimed_by: codyza_id, claimed_at: new Date().toISOString() })
        .eq("id", bounty_id)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
