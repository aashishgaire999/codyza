import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
  const form = await request.formData()
  const file = form.get("file")
  const altText = String(form.get("alt_text") || "")
  if (!(file instanceof File) || !ALLOWED.has(file.type)) return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF image" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 10MB" }, { status: 400 })

  const service = createServiceSupabase()
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  const fileName = `${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await service.storage.from("site-media").upload(fileName, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
  const { data: { publicUrl } } = service.storage.from("site-media").getPublicUrl(fileName)
  const { data, error } = await service.from("media_assets").insert({ file_name: file.name, public_url: publicUrl, alt_text: altText, mime_type: file.type, size_bytes: file.size }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
  const { id, alt_text } = await request.json() as { id?: string; alt_text?: string }
  if (!id || typeof alt_text !== "string") return NextResponse.json({ error: "Media id and alt text are required" }, { status: 400 })
  const { data, error } = await createServiceSupabase().from("media_assets").update({ alt_text }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}
