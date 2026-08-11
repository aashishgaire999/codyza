import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

export async function POST(req: Request) {
  try {
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const { submission_id, emoji } = await req.json()
    if (!submission_id || !emoji || !["🔥", "👏", "🚀", "💡"].includes(emoji)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const supabase = createServiceSupabase()

    // Check if reaction exists — toggle it
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("submission_id", submission_id)
      .eq("codyza_id", member.codyza_id)
      .eq("emoji", emoji)
      .single()

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id)
      return NextResponse.json({ action: "removed" })
    } else {
      await supabase.from("reactions").insert({ submission_id, codyza_id: member.codyza_id, emoji })
      return NextResponse.json({ action: "added" })
    }
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const member = await getRequestMember(req)
  if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get("ids")?.split(",") || []
  if (!ids.length) return NextResponse.json({})

  const { data } = await createServiceSupabase()
    .from("reactions")
    .select("submission_id, emoji, codyza_id")
    .in("submission_id", ids)

  // Group by submission_id
  const grouped: Record<string, Record<string, string[]>> = {}
  for (const r of data || []) {
    if (!grouped[r.submission_id]) grouped[r.submission_id] = {}
    if (!grouped[r.submission_id][r.emoji]) grouped[r.submission_id][r.emoji] = []
    grouped[r.submission_id][r.emoji].push(r.codyza_id)
  }

  return NextResponse.json(grouped)
}
