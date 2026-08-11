import "server-only"
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
