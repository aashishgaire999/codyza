"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, FileJson, ImageUp, Megaphone, Monitor, Newspaper, Plus, Save, Smartphone, Trash2, Upload } from "lucide-react"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { CosmicBackdrop } from "@/components/effects/cosmic-backdrop"
import { ThemeToggle } from "@/components/shared/theme-toggle"

type Entity = "news" | "media" | "content" | "announcements"
type Item = Record<string, any> & { id: string }
type Library = Record<Entity, Item[]>
const EMPTY: Library = { news: [], media: [], content: [], announcements: [] }

const PAGE_SECTIONS: Record<string, { key: string; label: string; hint: string }[]> = {
  home: [
    { key: "hero", label: "Hero", hint: "The first thing visitors see" },
    { key: "press", label: "Press ribbon", hint: "Featured coverage and trusted links" },
    { key: "about", label: "Who we are", hint: "The Codyza story" },
    { key: "projects", label: "Projects", hint: "What the crew is building" },
    { key: "chapters", label: "Learn / grow / ship", hint: "The Codyza path" },
    { key: "team", label: "The crew", hint: "Founders and contributors" },
    { key: "cta", label: "Join CTA", hint: "The final invitation" },
    { key: "footer", label: "Footer", hint: "Links and closing message" },
  ],
  about: [{ key: "intro", label: "Intro", hint: "Why Codyza exists" }, { key: "team", label: "The crew", hint: "People behind the work" }],
  community: [{ key: "intro", label: "Intro", hint: "Community promise" }, { key: "contributors", label: "Contributors", hint: "Visible member directory" }],
  projects: [{ key: "intro", label: "Intro", hint: "Project discovery" }, { key: "grid", label: "Project grid", hint: "Project cards and links" }],
  quest: [{ key: "intro", label: "Intro", hint: "Quest overview" }, { key: "steps", label: "Quest steps", hint: "How work moves forward" }],
  news: [{ key: "featured", label: "Featured story", hint: "News page highlight" }],
}

const DEFAULT_BLOCK = {
  headline: "building alone gets lonely.",
  copy: "Codyza is the crew for developers, designers, and ambitious builders who want to turn skills into real, shipped work.",
  cta: "join the crew",
  cta_href: "/join",
}

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
  const [editorPage, setEditorPage] = useState("home")
  const [editorSection, setEditorSection] = useState("hero")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [editorMode, setEditorMode] = useState<"visual" | "json">("visual")
  const [editorContent, setEditorContent] = useState<Record<string, unknown>>(DEFAULT_BLOCK)
  const [editorJson, setEditorJson] = useState(JSON.stringify(DEFAULT_BLOCK, null, 2))
  const [editorHidden, setEditorHidden] = useState(false)

  const selectedSavedBlock = library.content.find((item) => item.page_key === editorPage && item.section_key === editorSection)

  useEffect(() => {
    if (!selectedSavedBlock) {
      const next = editorPage === "home" && editorSection === "hero" ? DEFAULT_BLOCK : { headline: PAGE_SECTIONS[editorPage]?.find((section) => section.key === editorSection)?.label || "", copy: "Start writing this section here." }
      setEditorContent(next); setEditorJson(JSON.stringify(next, null, 2)); setEditorHidden(false); return
    }
    const nextContent = (selectedSavedBlock.content && typeof selectedSavedBlock.content === "object") ? selectedSavedBlock.content : {}
    setEditorContent(nextContent); setEditorJson(JSON.stringify(nextContent, null, 2)); setEditorHidden(selectedSavedBlock.published === false)
  }, [editorPage, editorSection, selectedSavedBlock?.id, selectedSavedBlock?.updated_at])

  function selectEditorPage(value: string) {
    setEditorPage(value); setEditorSection(PAGE_SECTIONS[value]?.[0]?.key || "intro")
  }

  function updateVisualField(key: string, value: string) {
    const next = { ...editorContent, [key]: value }
    setEditorContent(next); setEditorJson(JSON.stringify(next, null, 2))
  }

  function previewValue(key: string, fallback: string) {
    const value = editorContent[key]
    return typeof value === "string" && value.trim() ? value : fallback
  }

  async function saveVisualBlock() {
    try {
      const content = editorMode === "json" ? JSON.parse(editorJson) : editorContent
      await save("content", { page_key: editorPage, section_key: editorSection, content, published: !editorHidden })
    } catch { setError("Content must be valid JSON") }
  }

  async function deleteEditorBlock() {
    if (!selectedSavedBlock || !confirm("Delete this saved section? The live page will return to its default content.")) return
    await remove("content", selectedSavedBlock.id)
    setEditorContent(DEFAULT_BLOCK); setEditorJson(JSON.stringify(DEFAULT_BLOCK, null, 2)); setEditorHidden(false)
  }

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
    <div className="cosmic-workspace cosmic-admin min-h-screen" data-cosmic-zone="command"><CosmicBackdrop variant="command" /><ThemeToggle className="fixed right-4 top-4 z-50 bg-card/80 shadow-sm backdrop-blur-xl" /><div className="relative z-10 flex min-h-screen items-center justify-center p-4"><div className="surface-card w-full max-w-md p-6 sm:p-8"><Newspaper className="mb-5 h-8 w-8 text-accent" /><h1 className="text-2xl font-bold lowercase">creator studio</h1><p className="mt-2 text-sm text-muted-foreground">Use the admin access code to manage publishing.</p><input type="password" value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void verify()} className="glass-input mt-6 w-full px-4 py-3" placeholder="Access code" />{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<button onClick={() => void verify()} disabled={busy || !code} className="btn-primary mt-4 w-full rounded-full px-4 py-3">{busy ? "checking…" : "open studio"}</button></div></div></div>
  )

  return (
    <div className="cosmic-workspace cosmic-admin min-h-screen text-foreground" data-cosmic-zone="command">
      <CosmicBackdrop variant="command" />
      <header className="member-navbar sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6"><Link href="/"><CodyzaLogo size={28} variant="full" /></Link><span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">admin · creator studio</span><div className="flex items-center gap-2"><Link href="/admin" className="btn-ghost rounded-full px-3 py-2 text-xs">dashboard</Link><ThemeToggle className="shrink-0 bg-card/80" /></div></div></header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-7"><p className="member-hero-label">publishing controls</p><h1 className="member-headline mt-3">run the website <span className="text-accent">without editing code.</span></h1></div>
        <nav className="admin-tab-rail mb-6 flex gap-2 overflow-x-auto" aria-label="Content types">{TABS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActive(id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm ${active === id ? "border-accent/40 bg-accent/15 text-accent" : "border-border bg-card/60 text-muted-foreground"}`}><Icon className="h-4 w-4" />{label}<span className="text-xs opacity-60">{library[id].length}</span></button>)}</nav>
        {error && <div role="alert" className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        {active === "news" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><form onSubmit={(event) => { event.preventDefault(); void save("news", news) }} className="surface-card space-y-4 p-5 sm:p-6"><h2 className="text-lg font-semibold">Write a news post</h2><div className="grid gap-3 sm:grid-cols-2"><input className="glass-input px-3 py-2" placeholder="Slug" value={news.slug} onChange={(e) => setNews({ ...news, slug: e.target.value })} /><input className="glass-input px-3 py-2" placeholder="Title" value={news.title} onChange={(e) => setNews({ ...news, title: e.target.value })} /></div><textarea className="glass-input w-full px-3 py-2" rows={2} placeholder="Summary" value={news.summary} onChange={(e) => setNews({ ...news, summary: e.target.value })} /><textarea className="glass-input w-full px-3 py-2 font-mono text-sm" rows={12} placeholder="Post body — blank lines create paragraphs" value={news.body} onChange={(e) => setNews({ ...news, body: e.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><input className="glass-input px-3 py-2" placeholder="Cover image URL" value={news.cover_image_url} onChange={(e) => setNews({ ...news, cover_image_url: e.target.value })} /><input className="glass-input px-3 py-2" placeholder="Cover image alt text" value={news.cover_image_alt} onChange={(e) => setNews({ ...news, cover_image_alt: e.target.value })} /></div><div className="flex flex-wrap gap-3"><select className="glass-input px-3 py-2" value={news.tag} onChange={(e) => setNews({ ...news, tag: e.target.value })}><option>update</option><option>launch</option><option>announcement</option></select><select className="glass-input px-3 py-2" value={news.status} onChange={(e) => setNews({ ...news, status: e.target.value })}><option>draft</option><option>published</option><option>archived</option></select><button disabled={busy} className="btn-primary ml-auto rounded-full px-5 py-2">{busy ? "saving…" : "save post"}</button></div></form><ItemList entity="news" items={library.news} remove={remove} titleKey="title" /></div>}

        {active === "media" && <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]"><form onSubmit={upload} className="surface-card h-fit space-y-4 p-5"><h2 className="text-lg font-semibold">Upload an image</h2><input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required className="block w-full text-sm text-muted-foreground" /><input value={altText} onChange={(e) => setAltText(e.target.value)} className="glass-input w-full px-3 py-2" placeholder="Describe the image" /><button disabled={busy} className="btn-primary w-full gap-2 rounded-full px-4 py-2"><Upload className="h-4 w-4" />upload</button></form><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{library.media.map((item) => <article key={item.id} className="surface-card overflow-hidden"><img src={item.public_url} alt={item.alt_text} className="aspect-video w-full object-cover" /><div className="flex items-center gap-2 p-3"><input readOnly value={item.public_url} className="min-w-0 flex-1 bg-transparent text-xs text-muted-foreground" onFocus={(e) => e.currentTarget.select()} /><button onClick={() => void remove("media", item.id)} aria-label="Delete image"><Trash2 className="h-4 w-4 text-destructive" /></button></div></article>)}</div></div>}

        {active === "content" && <div className="space-y-5">
          <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div><p className="member-hero-label">visual editor</p><h2 className="mt-1 text-xl font-semibold">Edit the site, see the result.</h2></div>
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 p-1">
              <button onClick={() => setPreviewMode("desktop")} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${previewMode === "desktop" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}><Monitor className="h-3.5 w-3.5" />desktop</button>
              <button onClick={() => setPreviewMode("mobile")} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${previewMode === "mobile" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}><Smartphone className="h-3.5 w-3.5" />mobile</button>
            </div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[15rem_minmax(0,1fr)_20rem]">
            <aside className="surface-card h-fit p-3">
              <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">pages</p>
              <div className="space-y-1">{Object.entries(PAGE_SECTIONS).map(([page, sections]) => <div key={page}>
                <button onClick={() => selectEditorPage(page)} className={`w-full rounded-lg px-2 py-2 text-left text-sm font-medium ${editorPage === page ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted/50"}`}>{page}</button>
                {editorPage === page && <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">{sections.map((section) => <button key={section.key} onClick={() => setEditorSection(section.key)} className={`block w-full rounded-md px-2 py-1.5 text-left text-xs ${editorSection === section.key ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted/50"}`}><span className="block">{section.label}</span><span className="block text-[10px] opacity-60">{section.hint}</span></button>)}</div>}
              </div>)}</div>
              <button onClick={() => setEditorSection(`new-${Date.now()}`)} className="mt-3 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-2 py-2 text-xs text-muted-foreground hover:border-accent hover:text-accent"><Plus className="h-3.5 w-3.5" />new section</button>
            </aside>
            <div className={`surface-card overflow-hidden bg-muted/20 p-3 ${previewMode === "mobile" ? "max-w-[430px] justify-self-center" : ""}`}>
              <div className="mb-3 flex items-center justify-between px-2"><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">live preview · {editorPage} / {editorSection}</span><span className="text-[10px] text-muted-foreground">updates as you type</span></div>
              <div className="min-h-[520px] overflow-hidden rounded-2xl border border-border bg-background">
                <div className="flex h-12 items-center justify-between border-b border-border px-4"><CodyzaLogo size={24} variant="full" /><span className="rounded-full bg-foreground px-3 py-1 font-mono text-[10px] text-background">join</span></div>
                <div className={`p-6 sm:p-10 ${editorHidden ? "opacity-40" : ""}`}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{editorPage} / {editorSection}</p>
                  <h3 className="mt-6 max-w-2xl text-4xl font-semibold leading-[.95] tracking-tight sm:text-6xl">{previewValue("headline", PAGE_SECTIONS[editorPage]?.find((section) => section.key === editorSection)?.label || "Your section headline")}</h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{previewValue("copy", "Your section copy appears here while you edit.")}</p>
                  {previewValue("cta", "") && <button className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm text-background">{previewValue("cta", "")}</button>}
                </div>
              </div>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); void saveVisualBlock() }} className="surface-card h-fit space-y-4 p-4">
              <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">editing</p><p className="font-medium">{editorPage} / {editorSection}</p></div><button type="button" onClick={() => setEditorHidden((value) => !value)} className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground" title={editorHidden ? "Show section" : "Hide section"}>{editorHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              <div className="flex rounded-lg border border-border bg-muted/30 p-1"><button type="button" onClick={() => setEditorMode("visual")} className={`flex-1 rounded-md px-2 py-1.5 text-xs ${editorMode === "visual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>fields</button><button type="button" onClick={() => setEditorMode("json")} className={`flex-1 rounded-md px-2 py-1.5 text-xs ${editorMode === "json" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}><FileJson className="mr-1 inline h-3 w-3" />advanced</button></div>
              {editorMode === "visual" ? <div className="space-y-3">{["headline", "copy", "cta", "cta_href"].map((key) => <label key={key} className="block"><span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{key.replace("_", " ")}</span>{key === "copy" ? <textarea rows={4} value={String(editorContent[key] || "")} onChange={(e) => updateVisualField(key, e.target.value)} className="glass-input w-full px-3 py-2 text-sm" /> : <input value={String(editorContent[key] || "")} onChange={(e) => updateVisualField(key, e.target.value)} className="glass-input w-full px-3 py-2 text-sm" />}</label>)}</div> : <textarea value={editorJson} onChange={(e) => setEditorJson(e.target.value)} rows={14} className="glass-input w-full px-3 py-2 font-mono text-xs" />}
              <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={editorHidden} onChange={(e) => setEditorHidden(e.target.checked)} />hide this section</label>
              <button disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm"><Save className="h-4 w-4" />{busy ? "saving…" : "save changes"}</button>
              {selectedSavedBlock && <button type="button" onClick={() => void deleteEditorBlock()} className="flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-xs text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />delete saved block</button>}
              <p className="text-[11px] leading-5 text-muted-foreground">Save creates a draft-ready content block. Hide removes it from connected live sections without deleting your words.</p>
            </form>
          </div>
        </div>}

        {active === "announcements" && <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><form onSubmit={(event) => { event.preventDefault(); void save("announcements", { ...announcement, starts_at: announcement.starts_at || null, ends_at: announcement.ends_at || null, meeting_url: announcement.meeting_url || null }) }} className="surface-card space-y-4 p-5 sm:p-6"><h2 className="text-lg font-semibold">Post a member announcement</h2><input className="glass-input w-full px-3 py-2" placeholder="Title" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} /><textarea className="glass-input w-full px-3 py-2" rows={5} placeholder="Announcement" value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><select className="glass-input px-3 py-2" value={announcement.kind} onChange={(e) => setAnnouncement({ ...announcement, kind: e.target.value })}><option>general</option><option>meeting</option><option>release</option><option>urgent</option></select><input className="glass-input px-3 py-2" placeholder="Meeting link" value={announcement.meeting_url} onChange={(e) => setAnnouncement({ ...announcement, meeting_url: e.target.value })} /><input type="datetime-local" className="glass-input px-3 py-2" value={announcement.starts_at} onChange={(e) => setAnnouncement({ ...announcement, starts_at: e.target.value })} /><input type="datetime-local" className="glass-input px-3 py-2" value={announcement.ends_at} onChange={(e) => setAnnouncement({ ...announcement, ends_at: e.target.value })} /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={announcement.published} onChange={(e) => setAnnouncement({ ...announcement, published: e.target.checked })} />Publish to members</label><button disabled={busy} className="btn-primary rounded-full px-5 py-2">save announcement</button></form><ItemList entity="announcements" items={library.announcements} remove={remove} titleKey="title" /></div>}
      </main>
    </div>
  )
}

function ItemList({ entity, items, remove, titleKey }: { entity: Entity; items: Item[]; remove: (entity: Entity, id: string) => Promise<void>; titleKey: string }) {
  return <aside className="surface-card h-fit p-4"><h2 className="mb-3 text-sm font-semibold">Saved items</h2><div className="space-y-2">{items.length === 0 ? <p className="text-xs text-muted-foreground">Nothing here yet.</p> : items.map((item) => <div key={item.id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2"><span className="min-w-0 flex-1 truncate text-sm">{String(item[titleKey] || item.file_name || item.id)}</span><button onClick={() => void remove(entity, item.id)} aria-label="Delete item"><Trash2 className="h-4 w-4 text-destructive" /></button></div>)}</div></aside>
}
