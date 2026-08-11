import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

export async function GET(request: Request) {
  const member = await getRequestMember(request)
  if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
  const now = Date.now()
  const { data, error } = await createServiceSupabase().from("announcements").select("id,title,body,kind,meeting_url,starts_at,ends_at,created_at").eq("published", true).order("starts_at", { ascending: true, nullsFirst: false }).limit(24)
  if (error) return NextResponse.json({ announcements: [] })
  return NextResponse.json({ announcements: (data || []).filter((item) => !item.ends_at || new Date(item.ends_at).getTime() >= now).slice(0, 12) })
}
