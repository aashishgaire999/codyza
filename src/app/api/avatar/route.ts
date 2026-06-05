import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const codyza_id = formData.get("codyza_id") as string

    if (!file || !codyza_id) {
      return NextResponse.json({ error: "File and codyza_id required" }, { status: 400 })
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
    const fileName = `${codyza_id.toLowerCase()}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
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
      .eq("codyza_id", codyza_id)

    return NextResponse.json({ success: true, avatar_url: avatarUrl })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
