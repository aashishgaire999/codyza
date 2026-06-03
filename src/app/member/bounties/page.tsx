"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Zap, CheckCircle, Clock, User, Tag } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:      { label: "Open",      color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  claimed:   { label: "Claimed",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  completed: { label: "Completed", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
}

export default function BountiesPage() {
  const [bounties, setBounties] = useState<any[]>([])
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("open")
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { window.location.href = "/login"; return }
    const { data: contrib } = await supabase.from("contributors").select("*").eq("email", user.email).maybeSingle()
    setContributor(contrib)
    const res = await fetch("/api/bounties")
    const data = await res.json()
    setBounties(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function claimBounty(bountyId: string) {
    if (!contributor) return
    setClaiming(bountyId)
    await fetch("/api/bounties", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bounty_id: bountyId, codyza_id: contributor.codyza_id, action: "claim" }),
    })
    await loadData()
    setClaiming(null)
  }

  const filtered = bounties.filter(b => filter === "all" ? true : b.status === filter)
  const counts = {
    open: bounties.filter(b => b.status === "open").length,
    claimed: bounties.filter(b => b.status === "claimed").length,
    completed: bounties.filter(b => b.status === "completed").length,
    all: bounties.length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Bounties</h1>
        <p className="text-gray-400 text-sm">Pick up a task, build it, earn XP. Posted by admins and leads.</p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          {/* Filter tabs */}
          <div className="flex gap-1 mb-5 border-b border-white/[0.06]">
            {[
              { key: "open", label: "Open" },
              { key: "claimed", label: "Claimed" },
              { key: "completed", label: "Completed" },
              { key: "all", label: "All" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  filter === key ? "border-purple-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                }`}>
                {label}
                <span className={`ml-1.5 text-xs ${filter === key ? "text-purple-400" : "text-gray-600"}`}>
                  {counts[key as keyof typeof counts] ?? bounties.length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-28 animate-pulse bg-white/[0.03] rounded-xl border border-white/[0.06]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-xl">
              <Zap className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No {filter} bounties right now.</p>
              <p className="text-gray-600 text-sm mt-1">Check back soon — admins post new ones regularly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((bounty) => {
                const status = STATUS_CONFIG[bounty.status] || STATUS_CONFIG.open
                const isClaimed = bounty.claimed_by === contributor?.codyza_id
                const isOpen = bounty.status === "open"

                return (
                  <div key={bounty.id} className={`bg-white/[0.03] border rounded-xl p-5 transition-all hover:border-white/[0.15] ${isClaimed ? "border-yellow-500/20" : "border-white/[0.07]"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-white text-sm">{bounty.title}</h3>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: status.bg, color: status.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }}></span>
                            {status.label}
                          </div>
                          {isClaimed && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">Claimed by you</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-3">{bounty.description}</p>
                        {bounty.tech_tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {bounty.tech_tags.map((t: string) => (
                              <span key={t} className="px-2 py-0.5 text-[10px] rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />Posted by {bounty.poster_name}</span>
                          {bounty.claimer_name && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Claimed by {bounty.claimer_name}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(bounty.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <Zap className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-sm font-bold text-yellow-400">+{bounty.xp_reward} XP</span>
                        </div>
                        {isOpen && !isClaimed && (
                          <button
                            onClick={() => claimBounty(bounty.id)}
                            disabled={claiming === bounty.id}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {claiming === bounty.id ? "Claiming..." : "Claim bounty"}
                          </button>
                        )}
                        {isClaimed && (
                          <span className="text-xs text-yellow-400 font-medium">Submit via Projects →</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Info panel */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 sticky top-24">
            <h3 className="font-semibold text-white text-sm mb-3">How Bounties Work</h3>
            <div className="space-y-3">
              {[
                { step: "1", color: "#22c55e", text: "Browse open bounties and find one that fits your skills" },
                { step: "2", color: "#3b82f6", text: "Claim it — it's locked to you for 7 days" },
                { step: "3", color: "#8b5cf6", text: "Build it and submit via the Projects page" },
                { step: "4", color: "#f59e0b", text: "Admin approves → XP auto-awarded to your profile" },
              ].map(({ step, color, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                    {step}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{counts.open}</div>
                  <div className="text-[10px] text-gray-500">Open</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400">{counts.claimed}</div>
                  <div className="text-[10px] text-gray-500">Claimed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
