"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { JOIN_HREF, SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { FadeInView } from "@/components/effects/fade-in-view"

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

  return (
    <section className="cz-footer-activity" aria-labelledby="recently-at-codyza">
      <div className="flex items-center gap-2 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
        <span className="cz-live-dot" />
        <h2 id="recently-at-codyza" className="cz-micro text-white/55">live from the community</h2>
      </div>
      <div className="px-2 pb-2 sm:px-3 sm:pb-3">
        {events.length === 0 ? (
          <div className="cz-footer-activity-row text-white/45">Activity is loading…</div>
        ) : events.map((event) => {
          const content = (
            <>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACTIVITY_COLOR[event.type] }} aria-hidden />
              <span className="min-w-[26px] font-mono text-[10px] text-white/35">{formatAgo(event.ts)}</span>
              <span className="min-w-0 flex-1 truncate text-[12px] text-white/78">
                {event.text}
                {event.detail && <span className="ml-1.5 font-mono text-white/40">{event.detail}</span>}
              </span>
            </>
          )

          return event.detail ? (
            <a
              key={event.id}
              href={event.detail.startsWith("http") ? event.detail : `https://${event.detail}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cz-footer-activity-row"
              aria-label={`Open project: ${event.detail}`}
            >
              {content}
            </a>
          ) : (
            <Link key={event.id} href="/community" className="cz-footer-activity-row">
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function Footer() {
  const footerGroups = [
    {
      label: "explore",
      links: [
        { label: "projects", href: "/projects" },
        { label: "community", href: "/community" },
        { label: "leaderboard", href: "/leaderboard" },
        { label: "news", href: "/news" },
      ],
    },
    {
      label: "organization",
      links: [
        { label: "about", href: "/about" },
        { label: "quest", href: "/quest" },
        { label: "join", href: JOIN_HREF },
        { label: "contact", href: "/contact" },
      ],
    },
    {
      label: "trust",
      links: [
        { label: "verify a certificate", href: "/certificates/verify" },
        { label: "privacy", href: "/legal/privacy" },
        { label: "terms", href: "/legal/terms" },
      ],
    },
  ]

  return (
    <footer className="cz-footer cz-border-t">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <FadeInView variant="headline">
          <div className="grid items-stretch gap-6 py-9 md:grid-cols-[0.85fr_1.15fr] md:py-11">
            <div className="flex flex-col justify-between py-1">
              <div>
                <p className="font-[family-name:var(--font-instrument)] text-5xl lowercase tracking-[-0.04em] sm:text-6xl">codyza</p>
                <p className="cz-body mt-3 max-w-sm text-[13px] leading-6">
                  Real people, building useful software together.
                </p>
              </div>
              <Link href={JOIN_HREF} className="cz-footer-join mt-7 w-fit">
                join the crew
              </Link>
            </div>

            <RecentActivity />
          </div>

          <div className="cz-footer-directory cz-border-t py-7">
            {footerGroups.map((group) => (
              <nav key={group.label} aria-label={`${group.label} links`}>
                <p className="cz-micro mb-4">{group.label}</p>
                <div className="flex flex-col items-start gap-2">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="cz-body cz-footer-link text-[13px]">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}
            <nav aria-label="Elsewhere links">
              <p className="cz-micro mb-4">elsewhere</p>
              <div className="flex flex-col items-start gap-2">
                <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="cz-body cz-footer-link text-[13px]">github</a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="cz-body cz-footer-link text-[13px]">instagram</a>
                <a href={`mailto:${SITE_CONFIG.email}`} className="cz-body cz-footer-link text-[13px]">email</a>
                <a href={SOCIAL_LINKS.slack} target="_blank" rel="noopener noreferrer" className="cz-body cz-footer-link text-[13px]">slack</a>
              </div>
            </nav>
          </div>
        </FadeInView>

        <div className="cz-border-t flex flex-col items-start gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="cz-micro cz-footer-muted">
            © {new Date().getFullYear()} {SITE_CONFIG.name.toLowerCase()} · {SITE_CONFIG.tagline.toLowerCase()}
          </p>
          <a
            href={SOCIAL_LINKS.developer}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--cz-line)] px-3 py-1 text-[11px] transition-colors hover:border-[var(--cz-line-strong)]"
          >
            <span className="cz-footer-muted">built by</span>
            <span className="font-medium text-[var(--cz-ink)]">@aashishgaire999</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
