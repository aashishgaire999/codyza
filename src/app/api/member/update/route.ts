import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"

export async function POST(req: Request) {
  try {
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const { name, github, role, bio, skills } = await req.json()
    if (typeof name !== "string" || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: "Enter a valid name" }, { status: 400 })
    }

    const { error } = await createServiceSupabase()
      .from("contributors")
      .update({ name: name.trim(), github: String(github || "").trim(), role: String(role || "").trim(), bio: String(bio || "").slice(0, 1000), skills: Array.isArray(skills) ? skills.slice(0, 30) : [] })
      .eq("id", member.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
