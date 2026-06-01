import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { submission_id, codyza_id, emoji } = await req.json()
    if (!submission_id || !codyza_id || !emoji) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Check if reaction exists — toggle it
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("submission_id", submission_id)
      .eq("codyza_id", codyza_id)
      .eq("emoji", emoji)
      .single()

    if (existing) {
      await supabase.from("reactions").delete().eq("id", existing.id)
      return NextResponse.json({ action: "removed" })
    } else {
      await supabase.from("reactions").insert({ submission_id, codyza_id, emoji })
      return NextResponse.json({ action: "added" })
    }
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get("ids")?.split(",") || []
  if (!ids.length) return NextResponse.json({})

  const { data } = await supabase
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
