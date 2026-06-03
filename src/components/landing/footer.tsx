"use client"

import { SlackGateButton } from "@/components/landing/slack-gate-button"
import { useEffect, useState } from "react"
import Link from "next/link"
import { GitBranch as Github, Camera as Instagram, MessageCircle } from "lucide-react"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { createClient } from "@/lib/supabase"

interface Event {
  id: string
  ts: number
  type: "deploy" | "application" | "join"
  text: string
  detail?: string
}

const STATIC_FALLBACK: Event[] = [
  {
    id: "fallback-1",
    ts: Date.now() - 1000 * 60 * 60 * 12,
    type: "join",
    text: "CZX-0001 joined the crew",
  },
  {
    id: "fallback-2",
    ts: Date.now() - 1000 * 60 * 60 * 24,
    type: "deploy",
    text: "First project shipped",
  },
  {
    id: "fallback-3",
    ts: Date.now() - 1000 * 60 * 60 * 48,
    type: "application",
    text: "Founding contributors onboarding",
  },
]

const TYPE_COLOR: Record<Event["type"], string> = {
  deploy: "#22c55e",
  application: "#3b82f6",
  join: "#8b5cf6",
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

export function Footer() {
  const [events, setEvents] = useState<Event[]>(STATIC_FALLBACK)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const [{ data: subs }, { data: contribs }] = await Promise.all([
          supabase
            .from("submissions")
            .select("id, codyza_id, project_name, live_url, status, submitted_at")
            .order("submitted_at", { ascending: false })
            .limit(5),
          supabase
            .from("contributors")
            .select("id, codyza_id, joined_at")
            .order("joined_at", { ascending: false })
            .limit(5),
        ])

        const merged: Event[] = []

        for (const s of subs || []) {
          const ts = new Date(s.submitted_at as string).getTime()
          if (s.status === "approved" && s.live_url) {
            merged.push({
              id: `sub-${s.id}`,
              ts,
              type: "deploy",
              text: `${s.codyza_id} shipped`,
              detail: (s.live_url as string).replace(/^https?:\/\//, ""),
            })
          } else {
            merged.push({
              id: `app-${s.id}`,
              ts,
              type: "application",
              text: "New application received",
            })
          }
        }

        for (const c of contribs || []) {
          merged.push({
            id: `contrib-${c.id}`,
            ts: new Date(c.joined_at as string).getTime(),
            type: "join",
            text: `${c.codyza_id} joined the crew`,
          })
        }

        merged.sort((a, b) => b.ts - a.ts)
        const top3 = merged.slice(0, 3)
        if (top3.length >= 3) {
          setEvents(top3)
        } else {
          // Pad with static fallbacks
          const padded = [...top3, ...STATIC_FALLBACK].slice(0, 3)
          setEvents(padded)
        }
      } catch {
        // keep static fallback
      }
    }
    load()
  }, [])

  return (
    <footer className="relative border-t border-white/[0.06] bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">

        {/* TOP ROW: Wordmark left + Heartbeat right */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 mb-6">

          {/* LEFT: Wordmark + tagline */}
          <div>
            <div className="font-[family-name:var(--font-heading)] text-5xl font-bold leading-none tracking-tight md:text-6xl">
              <span className="text-white">cody</span>
              <span className="text-gradient-codyza">z</span>
              <span className="text-white">a</span>
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 md:text-xs">
              Build together
            </div>
          </div>

          {/* RIGHT: Heartbeat timeline */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Recently at Codyza
              </span>
            </div>
            <div className="relative pl-4">
              {/* Vertical timeline line */}
              <div
                className="absolute left-[3.5px] top-1 bottom-1 w-px"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(34,197,94,0.4), rgba(59,130,246,0.3), rgba(139,92,246,0.2))",
                }}
              />
              <div className="flex flex-col gap-2">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="relative flex items-baseline gap-2 text-[11px]"
                  >
                    <span
                      className="absolute top-1.5 h-[7px] w-[7px] rounded-full"
                      style={{
                        left: "-14px",
                        background: TYPE_COLOR[e.type],
                        boxShadow: `0 0 8px ${TYPE_COLOR[e.type]}66`,
                      }}
                    />
                    <span className="min-w-[24px] font-mono text-zinc-600">
                      {formatAgo(e.ts)}
                    </span>
                    <span className="text-zinc-300">
                      {e.text}
                      {e.detail && (
                        <span className="ml-1.5 font-mono text-zinc-500">
                          {e.detail}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* NAV: Horizontal with separator dots */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-y border-white/[0.05] py-3 mb-4 sm:gap-x-5">
          <Link href="/#about" className="text-sm text-zinc-300 transition-colors hover:text-white">About</Link>
          <SlackGateButton mode="text" />
          <span className="h-1 w-1 rounded-full bg-white/[0.15]" />
          <Link href="/apply" className="text-sm text-zinc-300 transition-colors hover:text-white">Apply</Link>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-300 transition-colors hover:text-white">GitHub</a>
          <span className="h-1 w-1 rounded-full bg-white/[0.15]" />
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm text-zinc-300 transition-colors hover:text-white">Contact</a>
        </div>

        {/* BOTTOM: Socials + copyright */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white">
              <Github className="h-3.5 w-3.5" />
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white">
              <Instagram className="h-3.5 w-3.5" />
            </a>
            
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-600">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name} &middot; All rights reserved
          </span>
        </div>

        {/* SIGNATURE: Centered credit pill */}
        <div className="border-t border-dashed border-white/[0.05] pt-3 text-center">
          <a
            href={SOCIAL_LINKS.developer}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/[0.06] px-3 py-1 text-[11px] transition-colors hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/[0.1]"
          >
            <Github className="h-2.5 w-2.5 text-zinc-400" />
            <span className="text-zinc-500">Built by</span>
            <span className="font-medium text-white">@aashishgaire999</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
