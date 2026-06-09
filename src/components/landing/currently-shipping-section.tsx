"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { ExternalLink } from "lucide-react"

interface Submission {
  id: string
  codyza_id: string
  project_name: string
  live_url: string | null
  status: string
}

interface Stats {
  total: number
  members: number
  live: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse: boolean }> = {
  approved: { label: "LIVE", color: "#22c55e", pulse: true },
  pending: { label: "IN REVIEW", color: "#f59e0b", pulse: false },
  reviewed: { label: "BUILDING", color: "#3b82f6", pulse: false },
}

export function CurrentlyShippingSection() {
  const [cards, setCards] = useState<Submission[]>([])
  const [contribMap, setContribMap] = useState<Map<string, string>>(new Map())
  const [stats, setStats] = useState<Stats>({ total: 0, members: 0, live: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: subs }, { data: contribs }] = await Promise.all([
        supabase.from("submissions").select("id, codyza_id, project_name, live_url, status").in("status", ["approved", "pending", "reviewed"]).order("submitted_at", { ascending: false }).limit(3),
        supabase.from("contributors").select("codyza_id, name"),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("contributors").select("*", { count: "exact", head: true }),
      ])
      setCards(subs || [])
      setContribMap(new Map((contribs || []).map((c: { codyza_id: string; name: string }) => [c.codyza_id, c.name])))
      const liveCount = (subs || []).filter((s: Submission) => s.status === "approved").length
      setStats({ total: (subs || []).length, members: 0, live: liveCount })
      setLoading(false)
    }
    load()
  }, [])

  const placeholders = Math.max(0, 3 - cards.length)

  return (
    <section className="relative scroll-mt-32 py-32 md:py-40" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="mx-auto max-w-7xl px-6 md:px-8">

        {/* HEADER */}
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Currently Shipping
          </div>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Real things, built right now.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base" style={{ color: "rgba(255,255,255,0.35)" }}>
            Live deployments from people inside the community.
          </p>
        </div>

        {/* BENTO STATS GRID */}
        <div className="mb-20 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: "Day 14", label: "since launch", accent: "#7c3aed" },
            { value: "Open to all", label: "no gatekeeping", accent: "#2563eb" },
            { value: "3", label: "projects shipping now", accent: "#22c55e" },
            { value: "$0", label: "forever — no fees", accent: "#06b6d4" },
          ].map(({ value, label, accent }) => (
            <div key={label} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(8px)" }}>
              <div className="font-[family-name:var(--font-heading)] text-2xl font-bold md:text-3xl" style={{ color: accent }}>
                {value}
              </div>
              <div className="mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* PROJECT CARDS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={`skel-${i}`} className="h-32 animate-pulse rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }} />
              ))
            : cards.map((sub) => {
                const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending
                const isLive = sub.status === "approved" && sub.live_url
                const contribName = contribMap.get(sub.codyza_id) || sub.codyza_id
                const cardInner = (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-2 w-2">
                        {cfg.pulse && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: cfg.color }} />}
                        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                      </span>
                      <span className="text-[10px] font-mono tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
                      {isLive && <ExternalLink className="ml-auto h-3.5 w-3.5 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }} />}
                    </div>
                    <div className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">{sub.project_name}</div>
                    <div className="mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>by {contribName}</div>
                  </>
                )
                const cardStyle = {
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "20px",
                  transition: "all 0.2s",
                }
                return isLive ? (
                  <a key={sub.id} href={sub.live_url!} target="_blank" rel="noopener noreferrer"
                    className="group block hover:-translate-y-0.5" style={cardStyle}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
                    {cardInner}
                  </a>
                ) : (
                  <div key={sub.id} className="group" style={cardStyle}>{cardInner}</div>
                )
              })}

          {!loading && Array.from({ length: placeholders }).map((_, i) => (
            <div key={`placeholder-${i}`} style={{ borderRadius: 16, padding: "20px", border: "1px dashed rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="text-[10px] font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>OPEN SLOT</span>
              </div>
              <div className="font-[family-name:var(--font-heading)] text-lg font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>Your project here</div>
              <div className="mt-1.5 text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>Build something. Ship it. Get on the board.</div>
            </div>
          ))}
        </div>

        {/* LOCATION PILLS */}
        <div className="mt-16 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] mr-2" style={{ color: "rgba(255,255,255,0.2)" }}>Building from</span>
          {["🇺🇸 Minnesota, US", "🇳🇵 Kathmandu, NP"].map(loc => (
            <span key={loc} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
              style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.5)" }}>
              {loc}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
            style={{ border: "1px dashed rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", color: "rgba(255,255,255,0.25)" }}>
            + you?
          </span>
        </div>

        {/* TESTIMONIAL PLACEHOLDER */}
        <div className="mt-10 rounded-2xl p-8 text-center"
          style={{ border: "1px dashed rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
          <p className="mx-auto max-w-md text-sm italic" style={{ color: "rgba(255,255,255,0.25)" }}>
            &ldquo;This space is for the first wave of contributors to share what Codyza means to them.&rdquo;
          </p>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.2)" }}>
            First testimonials coming soon
          </div>
        </div>
      </div>
    </section>
  )
}
