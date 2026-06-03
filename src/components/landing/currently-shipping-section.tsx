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
        supabase
          .from("submissions")
          .select("id, codyza_id, project_name, live_url, status")
          .in("status", ["approved", "pending", "reviewed"])
          .order("submitted_at", { ascending: false })
          .limit(3),
        supabase.from("contributors").select("codyza_id, name"),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("contributors").select("*", { count: "exact", head: true }),
      ])
      setCards(subs || [])
      setContribMap(new Map((contribs || []).map((c: { codyza_id: string; name: string }) => [c.codyza_id, c.name])))
      const liveCount = (subs || []).filter((s: Submission) => s.status === "approved").length
      setStats({
        total: (subs || []).length,
        members: 0,
        live: liveCount,
      })
      setLoading(false)
    }
    load()
  }, [])

  const placeholders = Math.max(0, 3 - cards.length)

  return (
    <section className="relative scroll-mt-32 border-t border-white/[0.04] bg-transparent py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
            </span>
            Currently Shipping
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
            Real things, built right now.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-zinc-400">
            Live deployments from people inside the community.
          </p>
        </div>

        {/* PROJECT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skel-${i}`}
                  className="h-32 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]"
                />
              ))
            : cards.map((sub) => {
                const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending
                const isLive = sub.status === "approved" && sub.live_url
                const contribName = contribMap.get(sub.codyza_id) || sub.codyza_id

                const cardInner = (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="relative flex h-2 w-2">
                        {cfg.pulse && (
                          <span
                            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                            style={{ background: cfg.color }}
                          />
                        )}
                        <span
                          className="relative inline-flex h-2 w-2 rounded-full"
                          style={{ background: cfg.color }}
                        />
                      </span>
                      <span
                        className="text-[10px] font-mono tracking-widest"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {isLive && (
                        <ExternalLink className="ml-auto h-3.5 w-3.5 text-zinc-500 transition-colors group-hover:text-white" />
                      )}
                    </div>
                    <div className="font-[family-name:var(--font-heading)] text-lg font-semibold text-white">
                      {sub.project_name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">by {contribName}</div>
                  </>
                )

                const cardClass =
                  "group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"

                return isLive ? (
                  <a
                    key={sub.id}
                    href={sub.live_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass + " hover:-translate-y-0.5"}
                  >
                    {cardInner}
                  </a>
                ) : (
                  <div key={sub.id} className={cardClass}>
                    {cardInner}
                  </div>
                )
              })}

          {/* PLACEHOLDERS */}
          {!loading &&
            Array.from({ length: placeholders }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-mono tracking-widest text-zinc-600">
                    OPEN SLOT
                  </span>
                </div>
                <div className="font-[family-name:var(--font-heading)] text-lg font-semibold text-zinc-600">
                  Your project here
                </div>
                <div className="mt-1 text-xs text-zinc-700">
                  Build something. Ship it. Get on the board.
                </div>
              </div>
            ))}
        </div>

        {/* STATS STRIP */}
        {/* STATS STRIP */}
        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/[0.06] pt-10 sm:grid-cols-4">
          <div className="text-center sm:text-left">
            <div className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-white md:text-4xl">
              Day 14
            </div>
            <div className="mt-1 text-xs text-zinc-500">since launch</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-white md:text-4xl">
              Open to all
            </div>
            <div className="mt-1 text-xs text-zinc-500">no gatekeeping</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-white md:text-4xl">
              3
            </div>
            <div className="mt-1 text-xs text-zinc-500">projects shipping now</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-gradient-codyza md:text-4xl">
              $0
            </div>
            <div className="mt-1 text-xs text-zinc-500">forever &mdash; no fees</div>
          </div>
        </div>

        {/* LOCATION PILLS */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600 mr-2">Building from</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-zinc-300">
            🇺🇸 Minnesota, US
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-xs text-zinc-300">
            🇳🇵 Kathmandu, NP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-white/[0.08] bg-white/[0.01] px-3 py-1 text-xs text-zinc-500">
            + you?
          </span>
        </div>

        {/* TESTIMONIALS COMING SOON */}
        <div className="mt-10 rounded-xl border border-dashed border-white/[0.06] bg-white/[0.01] p-6 text-center">
          <p className="mx-auto max-w-md text-sm italic text-zinc-500">
            &ldquo;This space is for the first wave of contributors to share what Codyza means to them.&rdquo;
          </p>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            First testimonials coming soon
          </div>
        </div>
      </div>
    </section>
  )
}
