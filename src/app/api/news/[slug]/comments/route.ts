import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/admin-auth"
import { getRequestMember } from "@/lib/member-auth"
import { consumeRateLimit } from "@/lib/security"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data, error } = await createServiceSupabase().from("news_comments").select("id, codyza_id, member_name, body, created_at").eq("news_slug", slug).eq("status", "published").order("created_at", { ascending: true })
  if (error) return NextResponse.json({ comments: [] })
  return NextResponse.json({ comments: data || [] })
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const member = await getRequestMember(request)
  if (!member) return NextResponse.json({ error: "Member sign-in required" }, { status: 401 })
  const rateLimit = consumeRateLimit(request, `comment:${member.codyza_id}`, 8, 10 * 60 * 1000)
  if (!rateLimit.allowed) return NextResponse.json({ error: "Please wait before posting another comment" }, { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } })
  const { slug } = await params
  const { body } = await request.json() as { body?: string }
  const comment = String(body || "").trim()
  if (!comment || comment.length > 1200) return NextResponse.json({ error: "Comment must be between 1 and 1,200 characters" }, { status: 400 })
  const service = createServiceSupabase()
  const { data: story } = await service.from("news_posts").select("slug").eq("slug", slug).eq("status", "published").maybeSingle()
  if (!story) return NextResponse.json({ error: "News story not found" }, { status: 404 })
  const { data, error } = await service.from("news_comments").insert({ news_slug: slug, contributor_id: member.id, codyza_id: member.codyza_id, member_name: member.name, body: comment }).select("id, codyza_id, member_name, body, created_at").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}
