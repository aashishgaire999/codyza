import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const { codyza_id, name, github, role, bio, skills } = await req.json()
    if (!codyza_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    const { error } = await supabase
      .from("contributors")
      .update({ name, github, role, bio, skills })
      .eq("codyza_id", codyza_id.toUpperCase())

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
