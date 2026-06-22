"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GitBranch as Github, Camera as Instagram } from "lucide-react"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { createClient } from "@/lib/supabase"
import { SlackGateButton } from "@/components/landing/slack-gate-button"

interface Event {
  id: string
  ts: number
  type: "deploy" | "application" | "join"
  text: string
  detail?: string
}

const STATIC_FALLBACK: Event[] = [
  { id: "fallback-1", ts: Date.now() - 1000 * 60 * 60 * 12, type: "join", text: "CZX-0001 joined the crew" },
  { id: "fallback-2", ts: Date.now() - 1000 * 60 * 60 * 24, type: "deploy", text: "First project shipped" },
  { id: "fallback-3", ts: Date.now() - 1000 * 60 * 60 * 48, type: "application", text: "Founding contributors onboarding" },
]

const TYPE_COLOR: Record<Event["type"], string> = {
  deploy: "#5e8b6e",
  application: "#c9c4b3",
  join: "#8a887e",
}

function formatAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days >= 1) return `${days}d`
  if (hrs >= 1) return `${hrs}h`
  if (mins >= 1) return `${mins}m`
  return "now"
}

export function LandingFooter() {
  const [events, setEvents] = useState<Event[]>(STATIC_FALLBACK)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [{ data: subs }, { data: contribs }] = await Promise.all([
          supabase.from("submissions").select("id, codyza_id, project_name, live_url, status, submitted_at").order("submitted_at", { ascending: false }).limit(5),
          supabase.from("contributors").select("id, codyza_id, joined_at").order("joined_at", { ascending: false }).limit(5),
        ])

        const merged: Event[] = []
        for (const s of subs || []) {
          const ts = new Date(s.submitted_at as string).getTime()
          if (s.status === "approved" && s.live_url) {
            merged.push({ id: `sub-${s.id}`, ts, type: "deploy", text: `${s.codyza_id} shipped`, detail: (s.live_url as string).replace(/^https?:\/\//, "") })
          } else {
            merged.push({ id: `app-${s.id}`, ts, type: "application", text: "New application received" })
          }
        }
        for (const c of contribs || []) {
          merged.push({ id: `contrib-${c.id}`, ts: new Date(c.joined_at as string).getTime(), type: "join", text: `${c.codyza_id} joined the crew` })
        }
        merged.sort((a, b) => b.ts - a.ts)
        if (merged.length >= 3) setEvents(merged.slice(0, 3))
      } catch {
        /* keep fallback */
      }
    }
    load()
  }, [])

  return (
    <footer className="landing-dark border-t border-[#f4f2ec]/10 px-6 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-[family-name:var(--font-fraunces)] text-[clamp(2.5rem,6vw,4rem)] font-light lowercase leading-none text-[#f4f2ec]">
              cody<span className="italic text-[#c9c4b3]">z</span>a
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#8a887e]">build together</p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5e8b6e] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#5e8b6e]" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a887e]">recently at codyza</span>
            </div>
            <div className="relative pl-4">
              <div className="absolute bottom-1 left-[3.5px] top-1 w-px bg-gradient-to-b from-[#5e8b6e]/40 via-[#c9c4b3]/30 to-transparent" />
              <div className="flex flex-col gap-2">
                {events.map((e) => (
                  <div key={e.id} className="relative flex items-baseline gap-2 text-[11px]">
                    <span className="absolute top-1.5 h-[7px] w-[7px] rounded-full" style={{ left: "-14px", background: TYPE_COLOR[e.type] }} />
                    <span className="min-w-[24px] font-mono text-[#8a887e]/60">{formatAgo(e.ts)}</span>
                    <span className="text-[#f4f2ec]/80">
                      {e.text}
                      {e.detail && <span className="ml-1.5 font-mono text-[#8a887e]">{e.detail}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-[#f4f2ec]/10 py-4 text-sm lowercase">
          <Link href="/#about" className="text-[#8a887e] hover:text-[#f4f2ec]">about</Link>
          <SlackGateButton mode="text" />
          <Link href="/apply" className="text-[#8a887e] hover:text-[#f4f2ec]">apply</Link>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-[#8a887e] hover:text-[#f4f2ec]">github</a>
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-[#8a887e] hover:text-[#f4f2ec]">contact</a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#f4f2ec]/10 text-[#8a887e] hover:text-[#f4f2ec]">
              <Github className="h-3.5 w-3.5" />
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#f4f2ec]/10 text-[#8a887e] hover:text-[#f4f2ec]">
              <Instagram className="h-3.5 w-3.5" />
            </a>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a887e]/60">
            © {new Date().getFullYear()} {SITE_CONFIG.name}
          </span>
        </div>

        <div className="mt-4 border-t border-dashed border-[#f4f2ec]/10 pt-4 text-center">
          <a href={SOCIAL_LINKS.developer} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-[#8a887e] hover:text-[#f4f2ec]">
            <Github className="h-2.5 w-2.5" />
            built by @aashishgaire999
          </a>
        </div>
      </div>
    </footer>
  )
}
