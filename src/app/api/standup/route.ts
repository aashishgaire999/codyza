import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function getThisWeekDate() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split("T")[0]
}

export async function POST(req: Request) {
  try {
    const { codyza_id, shipped, building, blockers } = await req.json()
    if (!codyza_id || !shipped || !building) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const week_date = getThisWeekDate()
    const { error } = await supabase.from("standups").upsert(
      { codyza_id, shipped, building, blockers: blockers || "", week_date },
      { onConflict: "codyza_id,week_date" }
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, week_date })
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const codyza_id = searchParams.get("codyza_id")
  if (!codyza_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

  const { data } = await supabase
    .from("standups")
    .select("*")
    .eq("codyza_id", codyza_id)
    .order("week_date", { ascending: false })
    .limit(8)

  return NextResponse.json(data || [])
}
