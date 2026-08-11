import { NextResponse } from "next/server"
import { createServiceSupabase, isAdminRequest } from "@/lib/admin-auth"

const TABLES = {
  content: "site_content",
  news: "news_posts",
  announcements: "announcements",
  media: "media_assets",
} as const

type Entity = keyof typeof TABLES

function unauthorized() {
  return NextResponse.json({ error: "Admin authorization required" }, { status: 401 })
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const service = createServiceSupabase()
  const result = await Promise.all(Object.entries(TABLES).map(async ([entity, table]) => {
    const orderColumn = entity === "content" ? "updated_at" : "created_at"
    const { data, error } = await service.from(table).select("*").order(orderColumn, { ascending: false })
    return [entity, error ? [] : data || []]
  }))
  return NextResponse.json(Object.fromEntries(result))
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const { entity, record } = await request.json() as { entity?: Entity; record?: Record<string, unknown> }
  if (!entity || !TABLES[entity] || !record) return NextResponse.json({ error: "Invalid content request" }, { status: 400 })

  const service = createServiceSupabase()
  const now = new Date().toISOString()
  let payload: Record<string, unknown> = { ...record, updated_at: now }

  if (entity === "news") {
    const slug = String(record.slug || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    if (!slug || !record.title || !record.summary || !record.body) return NextResponse.json({ error: "Slug, title, summary, and body are required" }, { status: 400 })
    payload = { ...payload, slug, published_at: record.status === "published" ? record.published_at || now : record.published_at || null }
  }

  if (entity === "content" && (!record.page_key || !record.section_key)) {
    return NextResponse.json({ error: "Page and section keys are required" }, { status: 400 })
  }

  const table = TABLES[entity]
  const conflict = entity === "content" ? "page_key,section_key" : entity === "news" ? "slug" : undefined
  const query = conflict
    ? service.from(table).upsert(payload, { onConflict: conflict }).select().single()
    : service.from(table).upsert(payload).select().single()
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) return unauthorized()
  const { entity, id } = await request.json() as { entity?: Entity; id?: string }
  if (!entity || !TABLES[entity] || !id) return NextResponse.json({ error: "Entity and id are required" }, { status: 400 })
  const { error } = await createServiceSupabase().from(TABLES[entity]).delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
