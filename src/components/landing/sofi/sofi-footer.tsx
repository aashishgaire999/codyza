"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { createClient } from "@/lib/supabase"
import { SlackGateButton } from "@/components/landing/slack-gate-button"

interface Event {
  id: string
  ts: number
  text: string
  detail?: string
}

const FALLBACK: Event[] = [
  { id: "1", ts: Date.now() - 86400000, text: "CZX-0001 joined the crew" },
  { id: "2", ts: Date.now() - 172800000, text: "First project shipped" },
  { id: "3", ts: Date.now() - 259200000, text: "Founding contributors onboarding" },
]

function formatAgo(ts: number) {
  const h = Math.floor((Date.now() - ts) / 3600000)
  const d = Math.floor(h / 24)
  if (d >= 1) return `${d}d`
  if (h >= 1) return `${h}h`
  return "now"
}

export function SofiFooter() {
  const [events, setEvents] = useState<Event[]>(FALLBACK)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [{ data: subs }, { data: contribs }] = await Promise.all([
          supabase.from("submissions").select("id, codyza_id, live_url, status, submitted_at").order("submitted_at", { ascending: false }).limit(5),
          supabase.from("contributors").select("id, codyza_id, joined_at").order("joined_at", { ascending: false }).limit(5),
        ])
        const merged: Event[] = []
        for (const s of subs || []) {
          const ts = new Date(s.submitted_at as string).getTime()
          merged.push({
            id: `s-${s.id}`,
            ts,
            text: s.status === "approved" && s.live_url ? `${s.codyza_id} shipped` : "New application received",
            detail: s.live_url ? String(s.live_url).replace(/^https?:\/\//, "") : undefined,
          })
        }
        for (const c of contribs || []) {
          merged.push({ id: `c-${c.id}`, ts: new Date(c.joined_at as string).getTime(), text: `${c.codyza_id} joined the crew` })
        }
        merged.sort((a, b) => b.ts - a.ts)
        if (merged.length >= 3) setEvents(merged.slice(0, 3))
      } catch { /* fallback */ }
    }
    load()
  }, [])

  return (
    <footer className="border-t border-black/10 px-4 py-16 sm:px-6 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="sofi-display text-black">codyza</p>
            <p className="sofi-micro mt-2">build in public / grow as a team / ship without fear</p>
          </div>
          <div>
            <p className="sofi-micro mb-4">recently at codyza</p>
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="flex gap-3 text-[13px]">
                  <span className="sofi-micro w-8 shrink-0">{formatAgo(e.ts)}</span>
                  <span className="text-black/70">
                    {e.text}
                    {e.detail && <span className="sofi-micro ml-2">{e.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/10 pt-8 sofi-body text-[13px]">
          <Link href="/#about" className="text-black/60 hover:text-black">about</Link>
          <SlackGateButton mode="text" />
          <Link href="/apply" className="text-black/60 hover:text-black">apply</Link>
          <Link href="/projects" className="text-black/60 hover:text-black">projects</Link>
          <Link href="/leaderboard" className="text-black/60 hover:text-black">leaderboard</Link>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-black">github</a>
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-black/60 hover:text-black">contact</a>
        </div>

        <p className="sofi-micro mt-8">
          © {new Date().getFullYear()} {SITE_CONFIG.name.toLowerCase()} · {SITE_CONFIG.tagline.toLowerCase()}
        </p>
      </div>
    </footer>
  )
}
