import "server-only"

import { promises as fs } from "node:fs"
import path from "node:path"
import { createServerSupabase } from "@/lib/supabase-server"

export type NewsTag = "launch" | "update" | "announcement"

export type NewsEntry = {
  id?: string
  slug: string
  title: string
  date: string
  summary: string
  tag: NewsTag
  body: string
  coverImageUrl?: string | null
  coverImageAlt?: string
}

const NEWS_DIRECTORY = path.join(process.cwd(), "content", "news")

function parseEntry(slug: string, source: string): NewsEntry | null {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return null

  const fields = Object.fromEntries(
    match[1].split("\n").map((line) => {
      const divider = line.indexOf(":")
      if (divider < 0) return [line.trim(), ""]
      return [line.slice(0, divider).trim(), line.slice(divider + 1).trim().replace(/^['\"]|['\"]$/g, "")]
    })
  )
  const tag = fields.tag as NewsTag
  if (!fields.title || !fields.date || !fields.summary || !["launch", "update", "announcement"].includes(tag)) return null
  return { slug, title: fields.title, date: fields.date, summary: fields.summary, tag, body: match[2].trim() }
}

async function getRepositoryEntries(): Promise<NewsEntry[]> {
  try {
    const files = (await fs.readdir(NEWS_DIRECTORY)).filter((file) => file.endsWith(".mdx"))
    const entries = await Promise.all(files.map(async (file) => {
      const source = await fs.readFile(path.join(NEWS_DIRECTORY, file), "utf8")
      return parseEntry(file.replace(/\.mdx$/, ""), source)
    }))
    return entries.filter((entry): entry is NewsEntry => Boolean(entry)).sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

async function getManagedEntries(): Promise<NewsEntry[]> {
  try {
    const { data, error } = await createServerSupabase()
      .from("news_posts")
      .select("id,slug,title,summary,body,tag,cover_image_url,cover_image_alt,published_at")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
    if (error) return []
    return (data || []).map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      summary: entry.summary,
      body: entry.body,
      tag: entry.tag as NewsTag,
      date: entry.published_at.slice(0, 10),
      coverImageUrl: entry.cover_image_url,
      coverImageAlt: entry.cover_image_alt || "",
    }))
  } catch {
    return []
  }
}

export async function getNewsEntries(): Promise<NewsEntry[]> {
  const [managed, repository] = await Promise.all([getManagedEntries(), getRepositoryEntries()])
  const entries = new Map(repository.map((entry) => [entry.slug, entry]))
  managed.forEach((entry) => entries.set(entry.slug, entry))
  return [...entries.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export async function getNewsEntry(slug: string) {
  const entries = await getNewsEntries()
  return entries.find((entry) => entry.slug === slug) || null
}

export function newsBodyBlocks(body: string) {
  return body.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)
}
