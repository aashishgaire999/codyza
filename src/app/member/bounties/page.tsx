"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Zap, CheckCircle, Clock, User } from "lucide-react"
import { MemberPageHeader } from "@/components/member/member-page-header"
import { memberFetch } from "@/lib/member-fetch"

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  open:      { label: "Open",      badge: "bg-success/10 text-success" },
  claimed:   { label: "Claimed",   badge: "bg-accent/10 text-accent" },
  completed: { label: "Completed", badge: "bg-accent/10 text-accent" },
  cancelled: { label: "Cancelled", badge: "bg-destructive/10 text-destructive" },
}

export default function BountiesPage() {
  const [bounties, setBounties] = useState<any[]>([])
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("open")
  const [claiming, setClaiming] = useState<string | null>(null)

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { window.location.href = "/login"; return }
    const { data: contrib } = await supabase.from("contributors").select("*").eq("email", user.email).maybeSingle()
    setContributor(contrib)
    const res = await memberFetch("/api/bounties")
    const data = await res.json()
    setBounties(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  async function claimBounty(bountyId: string) {
    if (!contributor) return
    setClaiming(bountyId)
    await memberFetch("/api/bounties", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bounty_id: bountyId, action: "claim" }),
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
    <>
      <MemberPageHeader
        label="member · bounties"
        title={
          <>
            open <span className="text-accent">bounties</span>
          </>
        }
        description="Small tasks with XP attached. Claim one, finish it, move on."
      />

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex gap-1 border-b border-border">
            {[
              { key: "open", label: "Open" },
              { key: "claimed", label: "Claimed" },
              { key: "completed", label: "Completed" },
              { key: "all", label: "All" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  filter === key ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {label}
                <span className={`ml-1.5 text-xs ${filter === key ? "text-accent" : "text-muted-foreground"}`}>
                  {counts[key as keyof typeof counts] ?? bounties.length}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="surface-card h-28 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="surface-card border-dashed py-16 text-center">
              <Zap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No {filter} bounties right now.</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon — admins post new ones regularly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((bounty) => {
                const status = STATUS_CONFIG[bounty.status] || STATUS_CONFIG.open
                const isClaimed = bounty.claimed_by === contributor?.codyza_id
                const isOpen = bounty.status === "open"

                return (
                  <div key={bounty.id} className={`surface-card p-5 transition-all ${isClaimed ? "border-accent/20" : ""}`}>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <h3 className="text-sm font-bold text-foreground">{bounty.title}</h3>
                          <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.badge.includes("success") ? "bg-success" : status.badge.includes("destructive") ? "bg-destructive" : "bg-accent"}`}></span>
                            {status.label}
                          </div>
                          {isClaimed && (
                            <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-xs text-accent">Claimed by you</span>
                          )}
                        </div>
                        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{bounty.description}</p>
                        {bounty.tech_tags?.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {bounty.tech_tags.map((t: string) => (
                              <span key={t} className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />Posted by {bounty.poster_name}</span>
                          {bounty.claimer_name && <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Claimed by {bounty.claimer_name}</span>}
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(bounty.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                      <div className="flex w-full flex-shrink-0 flex-row items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
                        <div className="flex items-center gap-1.5 rounded-xl border border-accent/20 bg-accent/10 px-3 py-1.5">
                          <Zap className="h-3.5 w-3.5 text-accent" />
                          <span className="text-sm font-bold text-accent">+{bounty.xp_reward} XP</span>
                        </div>
                        {isOpen && !isClaimed && (
                          <button
                            onClick={() => claimBounty(bounty.id)}
                            disabled={claiming === bounty.id}
                            className="btn-primary rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
                          >
                            {claiming === bounty.id ? "Claiming..." : "Claim bounty"}
                          </button>
                        )}
                        {isClaimed && (
                          <Link href={`/member/projects?bounty=${bounty.id}`} className="text-xs font-medium text-accent hover:underline">
                            Submit via Projects
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="surface-card sticky top-24 p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">How Bounties Work</h3>
            <div className="space-y-3">
              {[
                { step: "1", text: "Browse open bounties and find one that fits your skills" },
                { step: "2", text: "Claim it — it's locked to you for 7 days" },
                { step: "3", text: "Build it and submit via the Projects page" },
                { step: "4", text: "Admin approval awards XP to your profile" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-xs font-bold text-accent">
                    {step}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="arcade-stat p-3 text-center">
                  <div className="text-lg font-bold text-success">{counts.open}</div>
                  <div className="text-[10px] text-muted-foreground">Open</div>
                </div>
                <div className="arcade-stat p-3 text-center">
                  <div className="text-lg font-bold text-accent">{counts.claimed}</div>
                  <div className="text-[10px] text-muted-foreground">Claimed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
