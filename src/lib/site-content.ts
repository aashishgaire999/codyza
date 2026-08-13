import "server-only"
import { unstable_cache } from "next/cache"
import { createServerSupabase } from "@/lib/supabase-server"

export async function getSiteContent<T extends Record<string, unknown>>(pageKey: string, sectionKey: string): Promise<Partial<T>> {
  try {
    const { data, error } = await createServerSupabase().from("site_content").select("content").eq("page_key", pageKey).eq("section_key", sectionKey).eq("published", true).maybeSingle()
    if (error || !data?.content || typeof data.content !== "object") return {}
    return data.content as Partial<T>
  } catch {
    return {}
  }
}

export async function getSiteContentState<T extends Record<string, unknown>>(pageKey: string, sectionKey: string) {
  const read = unstable_cache(
    async () => {
      try {
        const { data, error } = await createServerSupabase().from("site_content").select("content,published").eq("page_key", pageKey).eq("section_key", sectionKey).maybeSingle()
        if (error || !data?.content || typeof data.content !== "object") return { content: {} as Partial<T>, published: true }
        return { content: data.content as Partial<T>, published: data.published !== false }
      } catch {
        return { content: {} as Partial<T>, published: true }
      }
    },
    ["site-content", pageKey, sectionKey],
    { revalidate: 30, tags: [`site-content:${pageKey}:${sectionKey}`] }
  )
  return read()
}
