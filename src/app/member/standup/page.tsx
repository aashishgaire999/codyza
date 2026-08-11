"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CalendarDays, Check, Clock3, History, TimerReset } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { MemberPageHeader } from "@/components/member/member-page-header"
import { memberFetch } from "@/lib/member-fetch"

type Contributor = { id: string; codyza_id: string }
type WorkSession = {
  id: string
  bounty_id: string | null
  group_id: string | null
  label: string | null
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  summary: string | null
  status: "active" | "completed" | "cancelled"
}
type Bounty = { id: string; title: string; claimed_by: string | null; status: string }
type Group = { id: string; name: string; members?: Array<{ codyza_id: string }> }

const panelMotion = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
  transition: { type: "spring" as const, bounce: 0, duration: 0.35 },
}

function formatElapsed(startedAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":")
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`
}

function startOfWeek() {
  const date = new Date()
  const day = date.getDay()
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1))
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export default function TimesheetPage() {
  const reduceMotion = useReducedMotion()
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [activeSession, setActiveSession] = useState<WorkSession | null>(null)
  const [history, setHistory] = useState<WorkSession[]>([])
  const [claimedBounties, setClaimedBounties] = useState<Bounty[]>([])
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())
  const [selectedBounty, setSelectedBounty] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [label, setLabel] = useState("")
  const [summary, setSummary] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { window.location.href = "/login"; return }
    const { data: member } = await supabase
      .from("contributors")
      .select("id,codyza_id")
      .eq("email", user.email)
      .maybeSingle()
    setContributor(member)
    if (!member) { setError("Your member profile could not be found."); setLoading(false); return }

    const [sessionsRes, bountiesRes, groupsRes] = await Promise.all([
      memberFetch("/api/work-sessions"),
      memberFetch("/api/bounties"),
      memberFetch("/api/groups"),
    ])
    const [sessions, bounties, groups] = await Promise.all([
      sessionsRes.json(), bountiesRes.json(), groupsRes.json(),
    ])
    if (!sessionsRes.ok) {
      setError(sessions.error || "Time tracking is temporarily unavailable.")
      setLoading(false)
      return
    }

    const memberSessions = Array.isArray(sessions) ? sessions as WorkSession[] : []
    setActiveSession(memberSessions.find((session) => session.status === "active") || null)
    setHistory(memberSessions.filter((session) => session.status === "completed"))
    setClaimedBounties(Array.isArray(bounties)
      ? bounties.filter((bounty: Bounty) => bounty.status === "claimed" && bounty.claimed_by === member.codyza_id)
      : [])
    setMyGroups(Array.isArray(groups)
      ? groups.filter((group: Group) => group.members?.some((person) => person.codyza_id === member.codyza_id))
      : [])
    setError("")
    setLoading(false)
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadData(), 0)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!activeSession) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [activeSession])

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(""), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  async function clockIn() {
    if (!contributor || busy) return
    setBusy(true)
    setError("")
    const response = await memberFetch("/api/work-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bounty_id: selectedBounty || null,
        group_id: selectedGroup || null,
        label: label || null,
      }),
    })
    const data = await response.json()
    if (!response.ok) { setError(data.error || "Could not clock in"); setBusy(false); return }
    setSelectedBounty("")
    setSelectedGroup("")
    setLabel("")
    setActiveSession(data.session)
    setNow(Date.now())
    setNotice("You are clocked in.")
    window.dispatchEvent(new CustomEvent("codyza:work-session", { detail: { startedAt: data.session.started_at } }))
    setBusy(false)
  }

  async function clockOut() {
    if (!activeSession || busy) return
    if (summary.trim().length < 3) { setError("Add a short summary before clocking out."); return }
    setBusy(true)
    setError("")
    const response = await memberFetch("/api/work-sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: activeSession.id, action: "clock_out", summary }),
    })
    const data = await response.json()
    if (!response.ok) { setError(data.error || "Could not clock out"); setBusy(false); return }
    setSummary("")
    setNotice(`Session saved · ${formatDuration(data.duration_minutes)}`)
    window.dispatchEvent(new CustomEvent("codyza:work-session", { detail: { startedAt: null } }))
    await loadData()
    setBusy(false)
  }

  const activeName = activeSession
    ? claimedBounties.find((item) => item.id === activeSession.bounty_id)?.title
      || myGroups.find((item) => item.id === activeSession.group_id)?.name
      || activeSession.label
      || "General contribution"
    : ""
  const thisWeek = useMemo(() => history.filter((session) => new Date(session.started_at).getTime() >= startOfWeek()), [history])
  const weeklyMinutes = thisWeek.reduce((total, session) => total + (session.duration_minutes || 0), 0)
  const stateMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } }
    : panelMotion

  return (
    <>
      <MemberPageHeader
        label="member · time"
        title={<>your work <span className="text-accent">timer</span></>}
        description="Start when you begin. End with a short note. Your history stays private to you and admins."
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-5">
          {notice && (
            <div role="status" className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              <Check className="h-4 w-4" /> {notice}
            </div>
          )}

          {loading ? (
            <div className="surface-card h-72 animate-pulse motion-reduce:animate-none" />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {activeSession ? (
                <motion.section key="active" {...stateMotion} className="time-active-panel overflow-hidden rounded-[1.35rem] border border-success/20 bg-card/90 shadow-xl">
                  <div className="border-b border-border/70 px-5 py-4 sm:px-7">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-success">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40 motion-reduce:animate-none" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                        </span>
                        Working now
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">private log</span>
                    </div>
                  </div>
                  <div className="px-5 py-7 sm:px-7 sm:py-9">
                    <p aria-live="off" className="font-mono text-[clamp(3.2rem,10vw,7.5rem)] font-medium leading-none tracking-[-0.07em] text-foreground tabular-nums">
                      {formatElapsed(activeSession.started_at, now)}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">{activeName}</p>
                    <div className="mt-8">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label htmlFor="session-summary" className="text-sm font-semibold text-foreground">What did you finish?</label>
                        <span className="font-mono text-[10px] text-muted-foreground">{summary.length}/2000</span>
                      </div>
                      <textarea
                        id="session-summary"
                        value={summary}
                        maxLength={2000}
                        onChange={(event) => setSummary(event.target.value)}
                        placeholder="A short, useful note about what changed…"
                        rows={4}
                        className="glass-input w-full resize-none px-4 py-3 text-sm leading-6 focus:outline-none"
                      />
                    </div>
                    {error && <p role="alert" className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">{error}</p>}
                    <button onClick={clockOut} disabled={busy} className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform active:scale-[0.97] disabled:opacity-50">
                      {busy ? "Saving session…" : "Clock out & save"}
                    </button>
                  </div>
                </motion.section>
              ) : (
                <motion.section key="ready" {...stateMotion} className="surface-card p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">What are you working on?</p>
                      <p className="mt-1 text-sm text-muted-foreground">Choose a source or add a simple label.</p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <TimerReset className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="bounty" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Bounty</label>
                      <select id="bounty" value={selectedBounty} onChange={(event) => { setSelectedBounty(event.target.value); if (event.target.value) setSelectedGroup("") }} className="glass-input min-h-12 w-full px-3 text-sm focus:outline-none">
                        <option value="">No bounty</option>
                        {claimedBounties.map((bounty) => <option key={bounty.id} value={bounty.id}>{bounty.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="group" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Group</label>
                      <select id="group" value={selectedGroup} onChange={(event) => { setSelectedGroup(event.target.value); if (event.target.value) setSelectedBounty("") }} className="glass-input min-h-12 w-full px-3 text-sm focus:outline-none">
                        <option value="">No group</option>
                        {myGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="work-label" className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Work label</label>
                    <input id="work-label" type="text" value={label} maxLength={160} onChange={(event) => setLabel(event.target.value)} placeholder="Reviewing PRs, writing docs, fixing onboarding…" className="glass-input min-h-12 w-full px-4 text-sm focus:outline-none" />
                  </div>
                  {error && <p role="alert" className="mt-3 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">{error}</p>}
                  <button onClick={clockIn} disabled={busy} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-white shadow-lg shadow-accent/15 transition-transform active:scale-[0.97] disabled:opacity-50">
                    {busy ? "Starting…" : "Clock in"}
                  </button>
                </motion.section>
              )}
            </AnimatePresence>
          )}

          <section aria-labelledby="session-history-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="session-history-heading" className="text-sm font-semibold text-foreground">Session history</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{history.length} total</span>
            </div>
            {history.length === 0 ? (
              <div className="surface-card flex min-h-36 flex-col items-center justify-center border-dashed px-4 text-center">
                <History className="mb-3 h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Your first session will appear here.</p>
                <p className="mt-1 text-xs text-muted-foreground">Clock in when you start real work.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.15rem] border border-border/80 bg-card/80">
                {history.map((session) => (
                  <article key={session.id} className="grid gap-2 border-b border-border/70 px-4 py-4 last:border-b-0 sm:grid-cols-[7.5rem_minmax(0,1fr)_5rem] sm:items-center sm:gap-4 sm:px-5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{new Date(session.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(session.started_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-accent">{claimedBounties.find((item) => item.id === session.bounty_id)?.title || myGroups.find((item) => item.id === session.group_id)?.name || session.label || "General contribution"}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{session.summary}</p>
                    </div>
                    <p className="font-mono text-sm font-medium text-foreground sm:text-right">{formatDuration(session.duration_minutes || 0)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="surface-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">This week</p>
            <p className="mt-3 font-[family-name:var(--font-heading)] text-4xl tracking-[-0.04em] text-foreground">{formatDuration(weeklyMinutes)}</p>
            <p className="mt-1 text-xs text-muted-foreground">across {thisWeek.length} {thisWeek.length === 1 ? "session" : "sessions"}</p>
          </div>
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold text-foreground">A clean work log</h2>
            <div className="mt-4 space-y-4">
              {[
                { icon: Clock3, title: "Start honestly", copy: "Clock in only when the work begins." },
                { icon: Check, title: "End with proof", copy: "Leave one useful note about what changed." },
                { icon: CalendarDays, title: "Keep your history", copy: "You and admins can review time later." },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"><Icon className="h-3.5 w-3.5" /></div>
                  <div><p className="text-xs font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
