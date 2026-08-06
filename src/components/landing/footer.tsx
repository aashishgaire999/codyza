"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { FadeInView } from "@/components/effects/fade-in-view"

function SlackGate() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
    }
  }, [open])

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-describedby={open ? "cz-slack-gate-tooltip" : undefined}
        className="cz-body cz-text-subtle cursor-pointer border-none bg-transparent p-0 text-left text-[13px] lowercase transition-colors hover:text-[var(--cz-ink)]"
      >
        slack
      </button>
      {open && (
        <span
          id="cz-slack-gate-tooltip"
          role="tooltip"
          className="cz-tooltip absolute bottom-[calc(100%+10px)] left-0 z-50 block w-[270px] rounded-xl px-3.5 py-3 text-left text-[11px] leading-relaxed"
        >
          <span className="font-medium text-[var(--cz-green)]">Members only</span>
          <br />
          Apply first and become a contributor — Slack access arrives by email from{" "}
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="font-medium transition-opacity hover:opacity-70"
          >
            {SITE_CONFIG.email}
          </a>{" "}
          once accepted.
        </span>
      )}
    </span>
  )
}

interface ActivityEvent {
  id: string
  ts: number
  type: "deploy" | "join"
  text: string
  detail?: string
}

const ACTIVITY_COLOR: Record<ActivityEvent["type"], string> = {
  deploy: "#22c55e",
  join: "#302bfb",
}

function formatAgo(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  const hrs = Math.floor(diff / 3600000)
  const mins = Math.floor(diff / 60000)
  if (days >= 1) return `${days}d`
  if (hrs >= 1) return `${hrs}h`
  if (mins >= 1) return `${mins}m`
  return "now"
}

function RecentActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: subs }, { data: contribs }] = await Promise.all([
        supabase
          .from("submissions")
          .select("id, codyza_id, live_url, status, submitted_at")
          .eq("status", "approved")
          .order("submitted_at", { ascending: false })
          .limit(5),
        supabase.from("contributors").select("id, codyza_id, joined_at").order("joined_at", { ascending: false }).limit(5),
      ])

      const merged: ActivityEvent[] = []
      for (const s of subs || []) {
        if (!s.live_url) continue
        merged.push({
          id: `sub-${s.id}`,
          ts: new Date(s.submitted_at).getTime(),
          type: "deploy",
          text: `${s.codyza_id} shipped`,
          detail: s.live_url.replace(/^https?:\/\//, ""),
        })
      }
      for (const c of contribs || []) {
        merged.push({
          id: `contrib-${c.id}`,
          ts: new Date(c.joined_at).getTime(),
          type: "join",
          text: `${c.codyza_id} joined the crew`,
        })
      }
      merged.sort((a, b) => b.ts - a.ts)
      setEvents(merged.slice(0, 3))
    }
    load()
  }, [])

  if (events.length === 0) return null

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="cz-live-dot" />
        <span className="cz-micro">recently at codyza</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {events.map((e) => (
          <div key={e.id} className="flex items-baseline gap-2.5 text-[12px]">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: ACTIVITY_COLOR[e.type] }}
              aria-hidden
            />
            <span className="min-w-[22px] font-mono text-[var(--cz-faint)]">{formatAgo(e.ts)}</span>
            <span className="text-[var(--cz-muted)]">
              {e.text}
              {e.detail && <span className="ml-1.5 font-mono text-[var(--cz-faint)]">{e.detail}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Footer() {
  const footerLinks = [
    { label: "about", href: "/#about" },
    { label: "apply", href: "/apply" },
    { label: "projects", href: "/projects" },
    { label: "leaderboard", href: "/leaderboard" },
  ]

  return (
    <footer className="cz-border-t">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <FadeInView variant="headline">
          <div className="grid gap-10 py-12 md:grid-cols-2">
            <div>
              <p className="font-[family-name:var(--font-instrument)] text-4xl lowercase">codyza</p>
              <p className="cz-micro mt-3">build in public · grow as a team · ship without fear</p>
            </div>

            <RecentActivity />
          </div>

          <nav className="cz-border-t flex flex-wrap items-center gap-x-6 gap-y-3 py-6">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="cz-body cz-footer-link text-[13px]">
                {l.label}
              </Link>
            ))}
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="cz-body cz-footer-link text-[13px]"
            >
              github
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="cz-body cz-footer-link text-[13px]"
            >
              instagram
            </a>
            <a href={`mailto:${SITE_CONFIG.email}`} className="cz-body cz-footer-link text-[13px]">
              contact
            </a>
            <SlackGate />
          </nav>
        </FadeInView>

        <div className="cz-border-t flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <p className="cz-micro cz-footer-muted">
            © {new Date().getFullYear()} {SITE_CONFIG.name.toLowerCase()} · {SITE_CONFIG.tagline.toLowerCase()}
          </p>
          <a
            href={SOCIAL_LINKS.developer}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cz-line)] px-3 py-1 text-[11px] transition-colors hover:border-[var(--cz-line-strong)]"
          >
            <span className="cz-footer-muted">built by</span>
            <span className="font-medium text-[var(--cz-ink)]">@aashishgaire999</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
