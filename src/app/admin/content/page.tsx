"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { FileJson, ImageUp, Megaphone, Newspaper, Trash2, Upload } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { CosmicBackdrop } from "@/components/effects/cosmic-backdrop"
import { ThemeToggle } from "@/components/shared/theme-toggle"

type Entity = "news" | "media" | "content" | "announcements"
type Item = Record<string, any> & { id: string }
type Library = Record<Entity, Item[]>
const EMPTY: Library = { news: [], media: [], content: [], announcements: [] }

const TABS: { id: Entity; label: string; icon: typeof Newspaper }[] = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "media", label: "Media", icon: ImageUp },
  { id: "content", label: "Site blocks", icon: FileJson },
  { id: "announcements", label: "Announcements", icon: Megaphone },
]

export default function AdminContentPage() {
  const [code, setCode] = useState("")
  const [verified, setVerified] = useState(false)
  const [active, setActive] = useState<Entity>("news")
  const [library, setLibrary] = useState<Library>(EMPTY)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [news, setNews] = useState({ slug: "", title: "", summary: "", body: "", tag: "update", cover_image_url: "", cover_image_alt: "", status: "draft" })
  const [block, setBlock] = useState({ page_key: "home", section_key: "", content: "{\n  \"headline\": \"\",\n  \"copy\": \"\"\n}" })
  const [announcement, setAnnouncement] = useState({ title: "", body: "", kind: "general", meeting_url: "", starts_at: "", ends_at: "", published: false })
  const [altText, setAltText] = useState("")

  useEffect(() => {
    void load().then((ok) => setVerified(ok))
  }, [])

  async function verify(value = code) {
    setBusy(true); setError("")
    const response = await fetch("/api/admin/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessCode: value }) })
    if (!response.ok || !(await response.json()).valid) { setError("That access code is not valid."); setBusy(false); return }
    setCode("")
    setVerified(true)
    await load()
    setBusy(false)
  }

  async function load() {
    const response = await fetch("/api/admin/content")
    const data = await response.json()
    if (!response.ok) { if (response.status !== 401) setError(data.error || "Content tables are not ready. Run the Supabase platform SQL."); return false }
    setLibrary({ ...EMPTY, ...data })
    return true
  }

  async function save(entity: Entity, record: Record<string, unknown>) {
    setBusy(true); setError("")
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, record }) })
    const data = await response.json()
    if (!response.ok) setError(data.error || "Could not save")
    else await load()
    setBusy(false)
  }

  async function remove(entity: Entity, id: string) {
    if (!confirm("Delete this item? This cannot be undone.")) return
    const response = await fetch("/api/admin/content", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, id }) })
    if (response.ok) await load()
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    form.set("alt_text", altText)
    setBusy(true); setError("")
    const response = await fetch("/api/admin/media", { method: "POST", body: form })
    const data = await response.json()
    if (!response.ok) setError(data.error || "Upload failed")
    else { setAltText(""); event.currentTarget.reset(); await load() }
    setBusy(false)
  }

  if (!verified) return (
    <div className="cosmic-workspace cosmic-admin min-h-screen" data-cosmic-zone="command"><CosmicBackdrop variant="command" /><ThemeToggle className="fixed right-4 top-4 z-50 bg-card/80 shadow-sm backdrop-blur-xl" /><div className="relative z-10 flex min-h-screen items-center justify-center p-4"><div className="surface-card w-full max-w-md p-6 sm:p-8"><Newspaper className="mb-5 h-8 w-8 text-accent" /><h1 className="text-2xl font-bold lowercase">content studio</h1><p className="mt-2 text-sm text-muted-foreground">Use the admin access code to manage publishing.</p><input type="password" value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void verify()} className="glass-input mt-6 w-full px-4 py-3" placeholder="Access code" />{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<button onClick={() => void verify()} disabled={busy || !code} className="btn-primary mt-4 w-full rounded-full px-4 py-3">{busy ? "checking…" : "open studio"}</button></div></div></div>
  )

  return (
    <div className="cosmic-workspace cosmic-admin min-h-screen text-foreground" data-cosmic-zone="command">
      <CosmicBackdrop variant="command" />
      <header className="member-navbar sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6"><Link href="/"><CodyzaLogo size={28} variant="full" /></Link><span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">admin · content studio</span><div className="flex items-center gap-2"><Link href="/admin" className="btn-ghost rounded-full px-3 py-2 text-xs">dashboard</Link><ThemeToggle className="shrink-0 bg-card/80" /></div></div></header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-7"><p className="member-hero-label">publishing controls</p><h1 className="member-headline mt-3">run the website <span className="text-accent">without editing code.</span></h1></div>
        <nav className="admin-tab-rail mb-6 flex gap-2 overflow-x-auto" aria-label="Content types">{TABS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActive(id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm ${active === id ? "border-accent/40 bg-accent/15 text-accent" : "border-border bg-card/60 text-muted-foreground"}`}><Icon className="h-4 w-4" />{label}<span className="text-xs opacity-60">{library[id].length}</span></button>)}</nav>
        {error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        {active === "news" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><form onSubmit={(event) => { event.preventDefault(); void save("news", news) }} className="surface-card space-y-4 p-5 sm:p-6"><h2 className="text-lg font-semibold">Write a news post</h2><div className="grid gap-3 sm:grid-cols-2"><input className="glass-input px-3 py-2" placeholder="Slug" value={news.slug} onChange={(e) => setNews({ ...news, slug: e.target.value })} /><input className="glass-input px-3 py-2" placeholder="Title" value={news.title} onChange={(e) => setNews({ ...news, title: e.target.value })} /></div><textarea className="glass-input w-full px-3 py-2" rows={2} placeholder="Summary" value={news.summary} onChange={(e) => setNews({ ...news, summary: e.target.value })} /><textarea className="glass-input w-full px-3 py-2 font-mono text-sm" rows={12} placeholder="Post body — blank lines create paragraphs" value={news.body} onChange={(e) => setNews({ ...news, body: e.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><input className="glass-input px-3 py-2" placeholder="Cover image URL" value={news.cover_image_url} onChange={(e) => setNews({ ...news, cover_image_url: e.target.value })} /><input className="glass-input px-3 py-2" placeholder="Cover image alt text" value={news.cover_image_alt} onChange={(e) => setNews({ ...news, cover_image_alt: e.target.value })} /></div><div className="flex flex-wrap gap-3"><select className="glass-input px-3 py-2" value={news.tag} onChange={(e) => setNews({ ...news, tag: e.target.value })}><option>update</option><option>launch</option><option>announcement</option></select><select className="glass-input px-3 py-2" value={news.status} onChange={(e) => setNews({ ...news, status: e.target.value })}><option>draft</option><option>published</option><option>archived</option></select><button disabled={busy} className="btn-primary ml-auto rounded-full px-5 py-2">{busy ? "saving…" : "save post"}</button></div></form><ItemList entity="news" items={library.news} remove={remove} titleKey="title" /></div>}

        {active === "media" && <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"><form onSubmit={upload} className="surface-card h-fit space-y-4 p-5"><h2 className="text-lg font-semibold">Upload an image</h2><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="block w-full text-sm text-muted-foreground" /><input value={altText} onChange={(e) => setAltText(e.target.value)} className="glass-input w-full px-3 py-2" placeholder="Describe the image" /><button disabled={busy} className="btn-primary w-full gap-2 rounded-full px-4 py-2"><Upload className="h-4 w-4" />upload</button></form><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{library.media.map((item) => <article key={item.id} className="surface-card overflow-hidden"><img src={item.public_url} alt={item.alt_text} className="aspect-video w-full object-cover" /><div className="flex items-center gap-2 p-3"><input readOnly value={item.public_url} className="min-w-0 flex-1 bg-transparent text-xs text-muted-foreground" onFocus={(e) => e.currentTarget.select()} /><button onClick={() => void remove("media", item.id)} aria-label="Delete image"><Trash2 className="h-4 w-4 text-destructive" /></button></div></article>)}</div></div>}

        {active === "content" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><form onSubmit={(event) => { event.preventDefault(); try { void save("content", { page_key: block.page_key, section_key: block.section_key, content: JSON.parse(block.content), published: true }) } catch { setError("Content must be valid JSON") } }} className="surface-card space-y-4 p-5 sm:p-6"><h2 className="text-lg font-semibold">Edit a site content block</h2><div className="grid gap-3 sm:grid-cols-2"><input className="glass-input px-3 py-2" placeholder="Page key, e.g. home" value={block.page_key} onChange={(e) => setBlock({ ...block, page_key: e.target.value })} /><input className="glass-input px-3 py-2" placeholder="Section key, e.g. stats" value={block.section_key} onChange={(e) => setBlock({ ...block, section_key: e.target.value })} /></div><textarea className="glass-input w-full px-3 py-2 font-mono text-sm" rows={14} value={block.content} onChange={(e) => setBlock({ ...block, content: e.target.value })} /><button disabled={busy} className="btn-primary rounded-full px-5 py-2">save block</button><p className="text-xs text-muted-foreground">Blocks are JSON so copy, links, images, and lists can evolve without another schema change.</p></form><ItemList entity="content" items={library.content} remove={remove} titleKey="section_key" /></div>}

        {active === "announcements" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><form onSubmit={(event) => { event.preventDefault(); void save("announcements", { ...announcement, starts_at: announcement.starts_at || null, ends_at: announcement.ends_at || null, meeting_url: announcement.meeting_url || null }) }} className="surface-card space-y-4 p-5 sm:p-6"><h2 className="text-lg font-semibold">Post a member announcement</h2><input className="glass-input w-full px-3 py-2" placeholder="Title" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} /><textarea className="glass-input w-full px-3 py-2" rows={5} placeholder="Announcement" value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><select className="glass-input px-3 py-2" value={announcement.kind} onChange={(e) => setAnnouncement({ ...announcement, kind: e.target.value })}><option>general</option><option>meeting</option><option>release</option><option>urgent</option></select><input className="glass-input px-3 py-2" placeholder="Meeting link" value={announcement.meeting_url} onChange={(e) => setAnnouncement({ ...announcement, meeting_url: e.target.value })} /><input type="datetime-local" className="glass-input px-3 py-2" value={announcement.starts_at} onChange={(e) => setAnnouncement({ ...announcement, starts_at: e.target.value })} /><input type="datetime-local" className="glass-input px-3 py-2" value={announcement.ends_at} onChange={(e) => setAnnouncement({ ...announcement, ends_at: e.target.value })} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={announcement.published} onChange={(e) => setAnnouncement({ ...announcement, published: e.target.checked })} />Publish to members</label><button disabled={busy} className="btn-primary rounded-full px-5 py-2">save announcement</button></form><ItemList entity="announcements" items={library.announcements} remove={remove} titleKey="title" /></div>}
      </main>
    </div>
  )
}

function ItemList({ entity, items, remove, titleKey }: { entity: Entity; items: Item[]; remove: (entity: Entity, id: string) => Promise<void>; titleKey: string }) {
  return <aside className="surface-card h-fit p-4"><h2 className="mb-3 text-sm font-semibold">Saved items</h2><div className="space-y-2">{items.length === 0 ? <p className="text-xs text-muted-foreground">Nothing here yet.</p> : items.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2"><span className="min-w-0 flex-1 truncate text-sm">{String(item[titleKey] || item.file_name || item.id)}</span><button onClick={() => void remove(entity, item.id)} aria-label="Delete item"><Trash2 className="h-4 w-4 text-destructive" /></button></div>)}</div></aside>
}
