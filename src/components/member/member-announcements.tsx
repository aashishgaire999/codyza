"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ExternalLink, Megaphone } from "lucide-react"
import { createClient } from "@/lib/supabase"

type Announcement = { id: string; title: string; body: string; kind: string; meeting_url: string | null; starts_at: string | null }

export function MemberAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([])

  useEffect(() => {
    void (async () => {
      const { data: { session } } = await createClient().auth.getSession()
      if (!session) return
      const response = await fetch("/api/announcements", { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (response.ok) setItems((await response.json()).announcements || [])
    })()
  }, [])

  if (items.length === 0) return null
  return (
    <section className="mb-8" aria-labelledby="member-announcements-title">
      <div className="mb-3 flex items-center gap-2"><Megaphone className="h-4 w-4 text-accent" /><h2 id="member-announcements-title" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">crew announcements</h2></div>
      <div className="grid gap-3 md:grid-cols-2">{items.slice(0, 4).map((item) => <article key={item.id} className="surface-card p-4"><div className="mb-2 flex items-center justify-between gap-3"><span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">{item.kind}</span>{item.starts_at && <time className="flex items-center gap-1 text-xs text-muted-foreground" dateTime={item.starts_at}><CalendarDays className="h-3 w-3" />{new Date(item.starts_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>}</div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>{item.meeting_url && <a href={item.meeting_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">open meeting <ExternalLink className="h-3 w-3" /></a>}</article>)}</div>
    </section>
  )
}
