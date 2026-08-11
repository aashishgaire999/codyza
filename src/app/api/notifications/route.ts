import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

export async function GET(req: Request) {
  const member = await getRequestMember(req)
  if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })

  const { data } = await createServiceSupabase()
    .from("notifications")
    .select("*")
    .eq("codyza_id", member.codyza_id)
    .order("created_at", { ascending: false })
    .limit(20)

  return NextResponse.json(data || [])
}

export async function POST(req: Request) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
  const { codyza_id, type, message, link } = await req.json()
  if (!codyza_id || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  await createServiceSupabase().from("notifications").insert({ codyza_id, type, message, link: link || "" })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request) {
  const member = await getRequestMember(req)
  if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
  const { id } = await req.json()
  const supabase = createServiceSupabase()
  if (id) {
    await supabase.from("notifications").update({ read: true }).eq("id", id).eq("codyza_id", member.codyza_id)
  } else {
    await supabase.from("notifications").update({ read: true }).eq("codyza_id", member.codyza_id)
  }
  return NextResponse.json({ success: true })
}
