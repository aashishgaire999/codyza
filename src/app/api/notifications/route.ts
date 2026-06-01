import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const codyza_id = searchParams.get("codyza_id")
  if (!codyza_id) return NextResponse.json([])

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("codyza_id", codyza_id)
    .order("created_at", { ascending: false })
    .limit(20)

  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  const { codyza_id, type, message, link } = await req.json()
  if (!codyza_id || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  await supabase.from("notifications").insert({ codyza_id, type, message, link: link || "" })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const { codyza_id, id } = await req.json()
  if (id) {
    await supabase.from("notifications").update({ read: true }).eq("id", id)
  } else if (codyza_id) {
    await supabase.from("notifications").update({ read: true }).eq("codyza_id", codyza_id)
  }
  return NextResponse.json({ success: true })
}
