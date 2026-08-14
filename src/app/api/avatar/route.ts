import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"
import { verifiedImageType } from "@/lib/security"

export async function POST(req: Request) {
  try {
    const member = await getRequestMember(req)
    if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "File required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 })
    }

    // Validate file size (2MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 })
    }

    const ext = file.type.split("/")[1]
    const fileName = `${member.codyza_id.toLowerCase()}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    if (!verifiedImageType(buffer, file.type)) {
      return NextResponse.json({ error: "The file contents do not match the selected image type" }, { status: 400 })
    }

    // Upload to Supabase Storage
    const supabase = createServiceSupabase()
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    // Add cache buster
    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    // Save URL to contributors table
    await supabase
      .from("contributors")
      .update({ avatar_url: avatarUrl })
      .eq("id", member.id)

    return NextResponse.json({ success: true, avatar_url: avatarUrl })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
