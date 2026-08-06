"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Clock, Zap, Users } from "lucide-react"
import { MemberPageHeader } from "@/components/member/member-page-header"

function formatElapsed(startedAt: string) {
  const ms = Date.now() - new Date(startedAt).getTime()
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export default function TimesheetPage() {
  const [contributor, setContributor] = useState<any>(null)
  const [activeSession, setActiveSession] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [claimedBounties, setClaimedBounties] = useState<any[]>([])
  const [myGroups, setMyGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  const [selectedBounty, setSelectedBounty] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [label, setLabel] = useState("")
  const [summary, setSummary] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { window.location.href = "/login"; return }
    const { data: contrib } = await supabase.from("contributors").select("*").eq("email", user.email).maybeSingle()
    setContributor(contrib)
    if (!contrib) { setLoading(false); return }

    const [sessionsRes, bountiesRes, groupsRes] = await Promise.all([
      fetch(`/api/work-sessions?codyza_id=${contrib.codyza_id}`),
      fetch("/api/bounties"),
      fetch("/api/groups"),
    ])
    const sessions = await sessionsRes.json()
    const bounties = await bountiesRes.json()
    const groups = await groupsRes.json()

    const active = Array.isArray(sessions) ? sessions.find((s: any) => s.status === "active") : null
    setActiveSession(active || null)
    setHistory(Array.isArray(sessions) ? sessions.filter((s: any) => s.status === "completed") : [])
    setClaimedBounties(
      Array.isArray(bounties) ? bounties.filter((b: any) => b.status === "claimed" && b.claimed_by === contrib.codyza_id) : []
    )
    setMyGroups(
      Array.isArray(groups) ? groups.filter((g: any) => g.members?.some((m: any) => m.codyza_id === contrib.codyza_id)) : []
    )
    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [activeSession])

  async function clockIn() {
    if (!contributor) return
    setBusy(true)
    setError("")
    const res = await fetch("/api/work-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codyza_id: contributor.codyza_id,
        bounty_id: selectedBounty || null,
        group_id: selectedGroup || null,
        label: label || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Could not clock in"); setBusy(false); return }
    setSelectedBounty(""); setSelectedGroup(""); setLabel("")
    await loadData()
    setBusy(false)
  }

  async function clockOut() {
    if (!activeSession || !summary.trim()) { setError("Add a summary before clocking out"); return }
    setBusy(true)
    setError("")
    const res = await fetch("/api/work-sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: activeSession.id, action: "clock_out", summary }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Could not clock out"); setBusy(false); return }
    setSummary("")
    await loadData()
    setBusy(false)
  }

  const activeBounty = activeSession?.bounty_id ? claimedBounties.find((b) => b.id === activeSession.bounty_id) : null
  const activeGroup = activeSession?.group_id ? myGroups.find((g) => g.id === activeSession.group_id) : null

  return (
    <>
      <MemberPageHeader
        label="member · timesheet"
        title={
          <>
            clock <span className="text-accent">in / out</span>
          </>
        }
        description="Log when you're working and what you got done. Visible to admins only."
      />

      <div className="flex flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          {loading ? (
            <div className="surface-card h-40 animate-pulse" />
          ) : activeSession ? (
            <div className="surface-card border-accent/20 p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-sm font-semibold text-foreground">Clocked in — {formatElapsed(activeSession.started_at)}</span>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Working on: {activeBounty?.title || activeGroup?.name || activeSession.label || "general contribution"}
              </p>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">What did you get done? *</label>
              <textarea
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short summary of what you worked on this session"
                rows={3}
                className="glass-input mb-3 w-full resize-none px-3 py-2 text-sm focus:outline-none"
              />
              {error && <p className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
              <button onClick={clockOut} disabled={busy} className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                {busy ? "Clocking out..." : "Clock Out"}
              </button>
            </div>
          ) : (
            <div className="surface-card p-6">
              <p className="mb-4 text-sm font-semibold text-foreground">What are you working on?</p>
              {claimedBounties.length > 0 && (
                <div className="mb-3">
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Claimed bounty</label>
                  <select value={selectedBounty} onChange={(e) => { setSelectedBounty(e.target.value); if (e.target.value) setSelectedGroup("") }} className="glass-input w-full px-3 py-2 text-sm focus:outline-none">
                    <option value="">None</option>
                    {claimedBounties.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              )}
              {myGroups.length > 0 && (
                <div className="mb-3">
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Group</label>
                  <select value={selectedGroup} onChange={(e) => { setSelectedGroup(e.target.value); if (e.target.value) setSelectedBounty("") }} className="glass-input w-full px-3 py-2 text-sm focus:outline-none">
                    <option value="">None</option>
                    {myGroups.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Or describe it (optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. reviewing PRs, writing docs"
                  className="glass-input w-full px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              {error && <p className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
              <button onClick={clockIn} disabled={busy} className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                {busy ? "Clocking in..." : "Clock In"}
              </button>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Past sessions</h3>
            {history.length === 0 ? (
              <div className="surface-card border-dashed py-10 text-center text-sm text-muted-foreground">No sessions logged yet.</div>
            ) : (
              <div className="space-y-3">
                {history.map((s: any) => (
                  <div key={s.id} className="surface-card p-4">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-foreground">
                        {new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(s.duration_minutes || 0)}
                      </span>
                    </div>
                    {(s.label || s.bounty_id || s.group_id) && (
                      <p className="mb-1 text-[11px] text-accent">
                        {claimedBounties.find((b) => b.id === s.bounty_id)?.title
                          || myGroups.find((g) => g.id === s.group_id)?.name
                          || s.label}
                      </p>
                    )}
                    <p className="text-xs leading-relaxed text-muted-foreground">{s.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-72 flex-shrink-0">
          <div className="surface-card sticky top-24 p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">How This Works</h3>
            <div className="space-y-3">
              {[
                { icon: Clock, text: "Clock in when you start working — pick a bounty/group or just describe it" },
                { icon: Zap, text: "Clock out and add a short summary of what you did" },
                { icon: Users, text: "Admins can see who's active and hours logged — this doesn't award XP" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
                    <Icon className="h-3 w-3 text-accent" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
