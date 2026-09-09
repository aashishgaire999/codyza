import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"
import { verifiedImageType } from "@/lib/security"

// Pulls the storage object path (e.g. "czx-0001-171234.png") back out of a
// public avatar URL, so the previous avatar can be cleaned up after a
// successful replacement without guessing its name.
function avatarStoragePath(avatarUrl: string | null) {
  if (!avatarUrl) return null
  const marker = "/avatars/"
  const withoutQuery = avatarUrl.split("?")[0]
  const index = withoutQuery.indexOf(marker)
  if (index === -1) return null
  return withoutQuery.slice(index + marker.length) || null
}

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
    // Versioned, not stable -- so a failure below only ever risks deleting
    // the file this request just uploaded, never a previous, still-live avatar.
    const fileName = `${member.codyza_id.toLowerCase()}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    if (!verifiedImageType(buffer, file.type)) {
      return NextResponse.json({ error: "The file contents do not match the selected image type" }, { status: 400 })
    }

    const supabase = createServiceSupabase()

    const { data: existing } = await supabase
      .from("contributors")
      .select("avatar_url")
      .eq("id", member.id)
      .maybeSingle()
    const previousPath = avatarStoragePath(existing?.avatar_url || null)

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
    const { error: profileError } = await supabase
      .from("contributors")
      .update({ avatar_url: avatarUrl })
      .eq("id", member.id)

    if (profileError) {
      // Only the file this request just uploaded, never the previous avatar.
      await supabase.storage.from("avatars").remove([fileName])
      console.error("Avatar profile update failed", { code: profileError.code, details: profileError.details })
      return NextResponse.json({ error: "Avatar was uploaded but could not be saved to your profile" }, { status: 500 })
    }

    // Best-effort cleanup of the old avatar now that the new one is live.
    // Awaited (this is a serverless function -- an unawaited call here could
    // get cut off once the response is sent) but its result doesn't affect
    // the response: a leftover orphaned file is a storage-cost detail, not
    // something that should fail an otherwise-successful upload.
    if (previousPath && previousPath !== fileName) {
      const { error: cleanupError } = await supabase.storage.from("avatars").remove([previousPath])
      if (cleanupError) console.error("Old avatar cleanup failed", { path: previousPath, message: cleanupError.message })
    }

    return NextResponse.json({ success: true, avatar_url: avatarUrl })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
