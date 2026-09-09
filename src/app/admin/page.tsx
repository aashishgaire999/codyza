"use client"

import { useState, useEffect, useRef } from "react"
import { RANKS as RANK_LADDER } from "@/lib/ranks"
import { Shield, Users, FileText, TrendingUp, CheckCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { CodyzaLogo } from "@/components/shared/codyza-logo"
import { CosmicBackdrop } from "@/components/effects/cosmic-backdrop"
import { ThemeToggle } from "@/components/shared/theme-toggle"


interface Contributor {
  id: string; codyza_id: string; name: string; email: string; github: string
  role: string; level: string; xp: number; rank: string; streak: number; joined_at: string
}
interface AiReview {
  summary?: string
  feedback?: string
  one_liner?: string
  strengths?: string[]
  improvements?: string[]
  roadmap?: string[]
}
interface Submission {
  id: string; codyza_id: string; project_name: string; github_url: string
  live_url: string | null; description: string; tech_stack: string[]
  ai_score: number | null; ai_feedback: string | null; ai_review: AiReview | null
  xp_earned: number; status: string; submitted_at: string
  group: { id: string; name: string; member_count: number } | null
  review_reason: string | null
}

const RANKS = RANK_LADDER.map((r) => r.name)
// Kept in sync with MAX_SESSION_MINUTES in src/lib/work-sessions.ts (can't
// import that module here -- it's server-only).
const MAX_SESSION_MINUTES = 720

function formatSessionDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function toDatetimeLocal(iso: string) {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function SessionEditModal({ session, onClose, onSave, saving }: { session: any; onClose: () => void; onSave: (_u: Record<string, unknown>) => void; saving: boolean }) {
  const [startedAt, setStartedAt] = useState(toDatetimeLocal(session.started_at))
  const [endedAt, setEndedAt] = useState(session.ended_at ? toDatetimeLocal(session.ended_at) : "")
  const [summary, setSummary] = useState(session.summary || "")
  const [isFinished, setIsFinished] = useState(session.is_finished !== false)
  const canEditEnd = session.status === "completed"
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-md p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold lowercase">edit session</h2>
          <button onClick={onClose} disabled={saving} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Started</label>
            <input type="datetime-local" value={startedAt} onChange={e => setStartedAt(e.target.value)} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Ended {!canEditEnd && "(clock out first)"}</label>
            <input type="datetime-local" value={endedAt} disabled={!canEditEnd} onChange={e => setEndedAt(e.target.value)} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none disabled:opacity-50"/>
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Summary</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={3} className="glass-input w-full resize-none rounded-xl px-3 py-2 text-sm focus:outline-none"/>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={isFinished} onChange={e => setIsFinished(e.target.checked)} />
            Marked as done
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={saving} className="btn-ghost flex-1 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50">Cancel</button>
          <button
            onClick={() => onSave({
              started_at: new Date(startedAt).toISOString(),
              ended_at: canEditEnd && endedAt ? new Date(endedAt).toISOString() : undefined,
              summary,
              is_finished: isFinished,
            })}
            disabled={saving}
            className="btn-primary flex-1 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

async function requireSuccessfulResponse(response: Response, fallback: string) {
  if (response.ok) return
  const data = await response.json().catch(() => null)
  throw new Error(data?.error || fallback)
}

function EditModal({ contributor, onClose, onSave, saving }: { contributor: Contributor; onClose: () => void; onSave: (_u: Partial<Contributor>) => void; saving: boolean }) {
  const [name, setName] = useState(contributor.name)
  const [email, setEmail] = useState(contributor.email)
  const [github, setGithub] = useState(contributor.github || "")
  const [role, setRole] = useState(contributor.role || "")
  const [level, setLevel] = useState(contributor.level || "")
  const [xp, setXp] = useState(contributor.xp)
  const [rank, setRank] = useState(contributor.rank)
  const [streak, setStreak] = useState(contributor.streak)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-md p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold lowercase">edit {contributor.codyza_id}</h2>
          <button onClick={onClose} disabled={saving} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="space-y-4">
          {[["Name","text",name,setName],["Email","email",email,setEmail],["GitHub","text",github,setGithub],["Role","text",role,setRole],["Level","text",level,setLevel]].map(([label,type,val,setter]: any) => (
            <div key={label}>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
              <input type={type} value={val} onChange={e => setter(e.target.value)} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
            </div>
          ))}
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rank</label>
            <select value={rank} onChange={e => setRank(e.target.value)} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none">
              {RANKS.map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">XP</label>
              <input type="number" value={xp} onChange={e => setXp(Number(e.target.value))} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Streak</label>
              <input type="number" value={streak} onChange={e => setStreak(Number(e.target.value))} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={saving} className="btn-ghost flex-1 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50">Cancel</button>
          <button onClick={() => onSave({name,email,github,role,level,xp,rank,streak})} disabled={saving} className="btn-primary flex-1 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview"|"contributors"|"submissions"|"applications"|"groups"|"bounties"|"sessions">("overview")
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [bounties, setBounties] = useState<any[]>([])
  const [workSessions, setWorkSessions] = useState<any[]>([])
  const [allContribs, setAllContribs] = useState<any[]>([])
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDesc, setNewGroupDesc] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<{id:string,role:string}[]>([])
  const [creatingGroup, setCreatingGroup] = useState(false)
  const [newBountyTitle, setNewBountyTitle] = useState("")
  const [newBountyDesc, setNewBountyDesc] = useState("")
  const [newBountyXP, setNewBountyXP] = useState(100)
  const [newBountyTags, setNewBountyTags] = useState("")
  const [creatingBounty, setCreatingBounty] = useState(false)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expandedAi, setExpandedAi] = useState<Set<string>>(new Set())
  const [bulkActioning, setBulkActioning] = useState(false)
  const [processingApp, setProcessingApp] = useState<string | null>(null)
  const [resendingApp, setResendingApp] = useState<string | null>(null)
  const [resentAppId, setResentAppId] = useState<string | null>(null)
  const [directInviteName, setDirectInviteName] = useState("")
  const [directInviteEmail, setDirectInviteEmail] = useState("")
  const [sendingDirectInvite, setSendingDirectInvite] = useState(false)
  const [directInviteNotice, setDirectInviteNotice] = useState("")
  const [applicationFilter, setApplicationFilter] = useState("pending")
  const [reasonBySubmission, setReasonBySubmission] = useState<Record<string, string>>({})
  const [processingSubmission, setProcessingSubmission] = useState<string | null>(null)
  const [sessionView, setSessionView] = useState<"all" | "by-person">("all")
  const [sessionPersonFilter, setSessionPersonFilter] = useState<string | null>(null)
  const [clockInCodyzaId, setClockInCodyzaId] = useState("")
  const [clockInLabel, setClockInLabel] = useState("")
  const [clockingIn, setClockingIn] = useState(false)
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null)
  const [editingSession, setEditingSession] = useState<any | null>(null)
  const [savingSessionEdit, setSavingSessionEdit] = useState(false)
  const loadRequestRef = useRef(0)

  // A stale/expired admin session cookie used to surface as a generic
  // "Admin authorization required" toast on whatever action the admin
  // happened to click next, with no way to recover except guessing to
  // reload. Every admin request goes through here, so catching a 401 in one
  // place drops back to the access-code screen instead, on any action.
  const adminFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const response = await fetch(input, init)
    if (response.status === 401) setIsAuthenticated(false)
    return response
  }

  const loadData = async () => {
    const requestId = ++loadRequestRef.current
    setLoading(true)
    const response = await adminFetch("/api/admin/dashboard")
    if (requestId !== loadRequestRef.current) return
    if (!response.ok) {
      if (response.status === 401) setIsAuthenticated(false)
      else {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Could not load the admin dashboard")
      }
      setLoading(false)
      return
    }
    const data = await response.json()
    setIsAuthenticated(true)
    setContributors(data.contributors || [])
    setAllContribs(data.contributors || [])
    setSubmissions(data.submissions || [])
    setApplications(data.applications || [])
    setGroups(data.groups || [])
    setBounties(data.bounties || [])
    setWorkSessions(data.workSessions || [])
    setLoading(false)
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleLogin = async () => {
    setVerifying(true); setError("")
    try {
      const res = await fetch("/api/admin/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ accessCode }) })
      const data = await res.json()
      if (data.valid) { setAccessCode(""); await loadData() }
      else setError("Invalid access code")
    } catch { setError("Network error. Please try again.") }
    finally { setVerifying(false) }
  }

  const updateSubStatus = async (id: string, status: "approved"|"rejected") => {
    if (processingSubmission) return
    setError("")
    setProcessingSubmission(id)
    try {
      const reason = reasonBySubmission[id]?.trim()
      const response = await adminFetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submission_status", payload: { id, status, reason } }) })
      await requireSuccessfulResponse(response, "Submission could not be updated")
      setReasonBySubmission(prev => { const next = { ...prev }; delete next[id]; return next })
    } catch (actionError) {
      // Someone else may have already approved/rejected/deleted it (e.g. two
      // admins reviewing at once) -- refresh either way so a stale card
      // doesn't just sit there erroring again on retry.
      setError(actionError instanceof Error ? actionError.message : "Submission could not be updated")
    } finally {
      await loadData()
      setProcessingSubmission(null)
    }
  }

  const deleteSub = async (id: string) => {
    if (!confirm("Delete this submission?")) return
    const response = await adminFetch("/api/admin/dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity: "submission", id }) })
    try { await requireSuccessfulResponse(response, "Submission could not be deleted"); await loadData() }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Submission could not be deleted") }
  }

  const saveContributor = async (updates: Partial<Contributor>) => {
    if (!editingContributor) return
    setSavingEdit(true)
    const response = await adminFetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "contributor_update", payload: { id: editingContributor.id, updates } }) })
    setSavingEdit(false)
    if (!response.ok) { const data = await response.json(); alert("Failed: " + data.error); return }
    setEditingContributor(null); void loadData()
  }

  const deleteContributor = async (id: string) => {
    if (!confirm("Delete this contributor and all their submissions?")) return
    const contributor = contributors.find((person) => person.codyza_id === id)
    if (!contributor) return
    const response = await adminFetch("/api/admin/dashboard", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity: "contributor", id: contributor.id }) })
    try { await requireSuccessfulResponse(response, "Contributor could not be deleted"); await loadData() }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Contributor could not be deleted") }
  }

  const bulkUpdate = async (status: "approved"|"rejected") => {
    if (selected.size === 0) return
    if (status === "rejected" && !confirm(`Reject ${selected.size} submissions?`)) return
    setBulkActioning(true)
    try {
      const response = await adminFetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bulk_submission_status", payload: { ids: Array.from(selected), status } }) })
      await requireSuccessfulResponse(response, "Submissions could not be updated")
      setSelected(new Set()); await loadData()
    } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Submissions could not be updated") }
    finally { setBulkActioning(false) }
  }

  const handleResendInvite = async (app: any) => {
    setResendingApp(app.id)
    setError("")
    try {
      const response = await adminFetch("/api/auth/resend-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: app.email }) })
      await requireSuccessfulResponse(response, "Could not resend the invite")
      setResentAppId(app.id)
      setTimeout(() => setResentAppId(null), 4000)
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not resend the invite")
    }
    setResendingApp(null)
  }

  const handleDirectInvite = async () => {
    if (directInviteName.trim().length < 2 || !directInviteEmail.trim()) return
    setSendingDirectInvite(true)
    setError("")
    setDirectInviteNotice("")
    try {
      const response = await adminFetch("/api/admin/direct-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: directInviteName.trim(), email: directInviteEmail.trim() }),
      })
      await requireSuccessfulResponse(response, "Could not send the invite")
      setDirectInviteNotice(`Invite sent to ${directInviteEmail.trim()}`)
      setDirectInviteName("")
      setDirectInviteEmail("")
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not send the invite")
    }
    setSendingDirectInvite(false)
  }

  const handleApplication = async (id: string, action: "approve"|"decline") => {
    setProcessingApp(id)
    try {
      const res = await adminFetch("/api/admin/invite", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ application_id: id, action }) })
      await requireSuccessfulResponse(res, "Application could not be processed")
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: action === "approve" ? "approved" : "declined" } : a))
    } catch(e) { setError(e instanceof Error ? e.message : "Application could not be processed") }
    setProcessingApp(null)
  }

  const adminClockIn = async () => {
    if (!clockInCodyzaId || clockingIn) return
    setClockingIn(true)
    setError("")
    try {
      const response = await adminFetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "session_clock_in", payload: { codyza_id: clockInCodyzaId, label: clockInLabel || undefined } }) })
      await requireSuccessfulResponse(response, "Could not clock this member in")
      setClockInCodyzaId(""); setClockInLabel("")
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not clock this member in")
    }
    setClockingIn(false)
  }

  const adminClockOut = async (id: string) => {
    if (processingSessionId) return
    setProcessingSessionId(id)
    setError("")
    try {
      const response = await adminFetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "session_clock_out", payload: { id } }) })
      await requireSuccessfulResponse(response, "Could not clock this session out")
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not clock this session out")
    }
    setProcessingSessionId(null)
  }

  const saveSessionEdit = async (updates: Record<string, unknown>) => {
    if (!editingSession) return
    setSavingSessionEdit(true)
    setError("")
    try {
      const response = await adminFetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "session_edit", payload: { id: editingSession.id, ...updates } }) })
      await requireSuccessfulResponse(response, "Could not update this session")
      setEditingSession(null)
      await loadData()
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update this session")
    }
    setSavingSessionEdit(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="cosmic-workspace cosmic-admin min-h-screen font-sans text-foreground antialiased" data-cosmic-zone="command">
        <CosmicBackdrop variant="command" />
        <ThemeToggle className="fixed right-4 top-4 z-50 bg-card/80 shadow-sm backdrop-blur-xl" />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="surface-card w-full max-w-md p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold lowercase">admin dashboard</h1>
          </div>
          <p className="mb-6 text-muted-foreground">Admin access code required.</p>
          <input type="password" value={accessCode} onChange={e => setAccessCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Access code"
            className="glass-input mb-4 w-full px-4 py-3"/>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <button onClick={handleLogin} disabled={verifying}
            className="btn-primary w-full rounded-full px-4 py-3 text-sm font-medium disabled:opacity-50">
            {verifying ? "Checking..." : "Continue"}
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-muted-foreground transition-colors hover:text-foreground">back home</Link>
        </div>
        </div>
      </div>
    )
  }

  const totalXP = contributors.reduce((sum, c) => sum + c.xp, 0)
  const pendingCount = submissions.filter(s => s.status === "pending").length
  const pendingApps = applications.filter(a => a.status === "pending").length

  const sessionStatsByPerson = (() => {
    const map = new Map<string, { codyza_id: string; name: string; totalMinutes: number; count: number; lastActive: string }>()
    for (const s of workSessions) {
      if (s.status !== "completed") continue
      const entry = map.get(s.codyza_id) || { codyza_id: s.codyza_id, name: s.member_name, totalMinutes: 0, count: 0, lastActive: s.started_at }
      entry.totalMinutes += s.duration_minutes || 0
      entry.count += 1
      if (s.started_at > entry.lastActive) entry.lastActive = s.started_at
      map.set(s.codyza_id, entry)
    }
    return Array.from(map.values()).sort((a, b) => b.totalMinutes - a.totalMinutes)
  })()
  const visibleSessions = sessionPersonFilter ? workSessions.filter((s: any) => s.codyza_id === sessionPersonFilter) : workSessions

  const renderApplicationCard = (app: any) => (
    <div key={app.id} className={`surface-card p-5 ${app.status === "approved" ? "border-success/20" : app.status === "declined" ? "border-destructive/10" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="text-base font-bold">{app.name}</span>
            <span className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${app.status === "pending" ? "border border-border bg-muted text-muted-foreground" : app.status === "approved" ? "border border-success/30 bg-success/10 text-success" : "border border-destructive/20 bg-destructive/10 text-destructive"}`}>{app.status}</span>
          </div>
          <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{app.email}</span>
            {app.github && <a href={`https://github.com/${app.github}`} target="_blank" rel="noopener noreferrer" className="text-accent transition-colors hover:opacity-80">@{app.github}</a>}
            <span>{app.role} · {app.level}</span>
            <span className="font-mono text-xs text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</span>
          </div>
          {app.skills && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {app.skills.split(",").slice(0,6).map((s: string) => (
                <span key={s} className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{s.trim()}</span>
              ))}
            </div>
          )}
          {app.why && (
            <p className="rounded-r-lg border-l-2 border-accent/30 bg-muted/30 py-2 pl-3 text-sm italic leading-relaxed text-muted-foreground">&ldquo;{app.why}&rdquo;</p>
          )}
          {app.status === "approved" && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
              {app.member ? (
                <>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-[10px] font-bold text-muted-foreground">
                    {app.member.avatar_url
                      ? <img src={app.member.avatar_url} alt={app.member.name} className="h-full w-full object-cover" />
                      : (app.member.name || "?").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">✓ In the system &middot; {app.member.name} <span className="font-mono text-accent">{app.member.codyza_id}</span></p>
                    <p className="text-[10px] text-muted-foreground">{app.last_sign_in_at ? `Last active ${new Date(app.last_sign_in_at).toLocaleString()}` : "Never signed in"}</p>
                  </div>
                </>
              ) : app.confirmed_at ? (
                <p className="text-xs text-muted-foreground">🕓 Confirmed their invite, hasn&apos;t finished onboarding yet.</p>
              ) : (
                <p className="text-xs text-muted-foreground">⏳ Invite not yet redeemed.</p>
              )}
            </div>
          )}
        </div>
        {app.status === "pending" && (
          <div className="flex flex-shrink-0 flex-col gap-2">
            <button onClick={() => handleApplication(app.id, "approve")} disabled={processingApp === app.id}
              className="rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/20 disabled:opacity-50">
              {processingApp === app.id ? "..." : "Approve ✓"}
            </button>
            <button onClick={() => handleApplication(app.id, "decline")} disabled={processingApp === app.id}
              className="rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50">
              Decline
            </button>
          </div>
        )}
        {app.status === "approved" && !app.member && (
          <div className="flex flex-shrink-0 flex-col items-end gap-1">
            <button onClick={() => handleResendInvite(app)} disabled={resendingApp === app.id}
              title="Sending this instantly kills any earlier invite link they haven't used yet"
              className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-50">
              {resendingApp === app.id ? "Sending..." : resentAppId === app.id ? "Sent ✓" : "Resend invite"}
            </button>
            <p className="max-w-[140px] text-right text-[10px] leading-tight text-muted-foreground">Invalidates their current link if unused</p>
          </div>
        )}
      </div>
    </div>
  )

  const applicationSections = [
    { key: "pending", label: "pending", items: applications.filter(a => a.status === "pending") },
    { key: "approved-unredeemed", label: "approved · not in the system yet", items: applications.filter(a => a.status === "approved" && !a.member) },
    { key: "in-system", label: "in the system", items: applications.filter(a => a.status === "approved" && a.member) },
    { key: "declined", label: "declined", items: applications.filter(a => a.status === "declined") },
  ]

  return (
    <div className="cosmic-workspace cosmic-admin min-h-screen font-sans text-foreground antialiased" data-cosmic-zone="command">
      <CosmicBackdrop variant="command" />
      <nav className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <CodyzaLogo size={28} variant="full" />
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Admin</span>
        </div>
        <div className="flex items-center gap-2"><Link href="/admin/content" className="btn-ghost rounded-full px-3 py-1.5 text-xs">Creator Studio</Link><Link href="/member" className="btn-ghost rounded-full px-3 py-1.5 text-xs">Member Hub</Link><ThemeToggle className="shrink-0 bg-card/80" /></div>
      </nav>
      <div className="cosmic-admin-content relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-accent" />
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold lowercase">admin dashboard</h1>
          <Link href="/admin/analytics" className="ml-auto text-sm text-accent transition-colors hover:opacity-80">Analytics</Link>
        </div>

        {error && <div role="alert" className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error" className="shrink-0">×</button></div>}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="dashboard-stat">
            <div className="mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-accent"/><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Contributors</span></div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold">{contributors.length}</p>
          </div>
          <div className="dashboard-stat">
            <div className="mb-2 flex items-center gap-2"><FileText className="h-4 w-4 text-accent"/><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Submissions</span></div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold">{submissions.length}</p>
          </div>
          <div className="dashboard-stat">
            <div className="mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent"/><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total XP</span></div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold">{totalXP.toLocaleString()}</p>
          </div>
          <div className="dashboard-stat">
            <div className="mb-2 flex items-center gap-2"><Shield className="h-4 w-4 text-accent"/><span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Applications</span></div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold">{pendingApps}</p>
          </div>
        </div>

        <div className="admin-tab-rail mb-6 flex gap-1 overflow-x-auto border-b border-border pb-0">
          {(["overview","contributors","submissions","applications","groups","bounties","sessions"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}`}>
              {tab === "submissions" ? `Submissions (${pendingCount})` : tab === "applications" ? `Applications (${pendingApps})` : tab === "contributors" ? `Contributors (${contributors.length})` : tab === "groups" ? `Groups (${groups.length})` : tab === "bounties" ? `Bounties (${bounties.length})` : tab === "sessions" ? `Sessions (${workSessions.filter((s:any)=>s.status==="active").length} active)` : "Overview"}
            </button>
          ))}
        </div>

        {loading && <p className="py-12 text-center text-muted-foreground">Loading...</p>}

        {activeTab === "overview" && !loading && (
          <div className="space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold lowercase">recent activity</h2>
            {submissions.slice(0,5).map(sub => (
              <div key={sub.id} className="surface-card flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{sub.project_name}</p>
                  <p className="text-sm text-muted-foreground">{sub.codyza_id} · {new Date(sub.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-lg px-3 py-1 text-sm font-semibold ${sub.status === "pending" ? "bg-muted text-muted-foreground" : sub.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "contributors" && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["ID","Name","Email","XP","Rank","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contributors.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-sm text-accent">{c.codyza_id}</td>
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{c.xp}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingContributor(c)} className="rounded-lg border border-border bg-muted p-1.5 text-accent transition-colors hover:bg-muted/80"><FileText className="h-3.5 w-3.5"/></button>
                        <button onClick={() => deleteContributor(c.codyza_id)} className="rounded-lg border border-destructive/30 bg-destructive/10 p-1.5 text-destructive transition-colors hover:bg-destructive/20"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "submissions" && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{selected.size > 0 ? `${selected.size} selected` : `${submissions.length} total`}</span>
                {selected.size === 0
                  ? <button onClick={() => setSelected(new Set(submissions.map(s => s.id)))} className="text-xs text-accent hover:opacity-80">Select all</button>
                  : <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => bulkUpdate("approved")} disabled={selected.size === 0 || bulkActioning}
                  className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-sm font-medium text-success hover:bg-success/20 disabled:opacity-40">
                  <CheckCircle className="h-4 w-4"/> Approve selected
                </button>
                <button onClick={() => bulkUpdate("rejected")} disabled={selected.size === 0 || bulkActioning}
                  className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 disabled:opacity-40">
                  <XCircle className="h-4 w-4"/> Reject selected
                </button>
              </div>
            </div>
            {submissions.map(sub => (
              <div key={sub.id} className={`surface-card p-5 transition-colors ${selected.has(sub.id) ? "border-accent/40 bg-accent/5" : ""}`}>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(sub.id)} onChange={() => setSelected(prev => { const n = new Set(prev); n.has(sub.id) ? n.delete(sub.id) : n.add(sub.id); return n })}
                      className="mt-1.5 h-4 w-4 cursor-pointer accent-[var(--accent)]"/>
                    <div>
                      <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold lowercase">{sub.project_name}</h3>
                      <p className="text-sm text-muted-foreground">{sub.codyza_id} · {new Date(sub.submitted_at).toLocaleDateString()}</p>
                      {sub.group && (
                        <p className="mt-1 text-xs font-medium text-accent">👥 Group submission &middot; {sub.group.name} &middot; XP goes to all {sub.group.member_count} members</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.ai_score && <span className="rounded-lg border border-border bg-muted px-2 py-1 text-sm font-bold text-accent">{sub.ai_score}/10</span>}
                    <span className="rounded-lg border border-border bg-muted px-2 py-1 text-sm font-bold text-foreground">+{sub.xp_earned} XP</span>
                    <span className={`rounded-lg px-2 py-1 text-sm ${sub.status === "pending" ? "bg-muted text-muted-foreground" : sub.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{sub.status}</span>
                  </div>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">{sub.description}</p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {sub.tech_stack?.map(t => <span key={t} className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{t}</span>)}
                </div>
                {sub.status !== "pending" && sub.review_reason && (
                  <p className="mb-3 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">Note sent to submitter: {sub.review_reason}</p>
                )}
                {(sub.ai_review?.summary || sub.ai_review?.feedback || sub.ai_review?.one_liner || sub.ai_feedback) && (
                  <div className="mb-3">
                    <button
                      onClick={() => setExpandedAi(prev => { const n = new Set(prev); n.has(sub.id) ? n.delete(sub.id) : n.add(sub.id); return n })}
                      className="text-xs font-medium text-accent hover:opacity-80"
                    >
                      {expandedAi.has(sub.id) ? "Hide AI review ▲" : "View full AI review ▼"}
                    </button>
                    {expandedAi.has(sub.id) && (
                      <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                        {sub.ai_review?.one_liner && <p className="font-semibold text-foreground">{sub.ai_review.one_liner}</p>}
                        {sub.ai_review?.summary && <p>{sub.ai_review.summary}</p>}
                        {(sub.ai_review?.feedback || sub.ai_feedback) && <p>{sub.ai_review?.feedback || sub.ai_feedback}</p>}
                        {!!sub.ai_review?.strengths?.length && (
                          <div>
                            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-success">Strengths</p>
                            <ul className="list-inside list-disc space-y-0.5">{sub.ai_review.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                          </div>
                        )}
                        {!!sub.ai_review?.improvements?.length && (
                          <div>
                            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-destructive">Improvements</p>
                            <ul className="list-inside list-disc space-y-0.5">{sub.ai_review.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
                          </div>
                        )}
                        {!!sub.ai_review?.roadmap?.length && (
                          <div>
                            <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-accent">Roadmap</p>
                            <ul className="list-inside list-disc space-y-0.5">{sub.ai_review.roadmap.map((s, i) => <li key={i}>{s}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {sub.status === "pending" && (
                  <input
                    value={reasonBySubmission[sub.id] || ""}
                    onChange={e => setReasonBySubmission(prev => ({ ...prev, [sub.id]: e.target.value }))}
                    placeholder="Reason for approve/reject (optional, shown to submitter)"
                    className="glass-input mb-3 w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                )}
                <div className="flex items-center gap-4">
                  <a href={sub.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">GitHub</a>
                  {sub.live_url && <a href={sub.live_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent transition-colors hover:opacity-80">Live</a>}
                  <div className="ml-auto flex gap-2">
                    {sub.status === "pending" && (
                      <>
                        <button onClick={() => updateSubStatus(sub.id, "approved")} disabled={processingSubmission === sub.id} className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-sm text-success transition-colors hover:bg-success/20 disabled:opacity-50"><CheckCircle className="w-3.5 h-3.5"/>Approve</button>
                        <button onClick={() => updateSubStatus(sub.id, "rejected")} disabled={processingSubmission === sub.id} className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"><XCircle className="w-3.5 h-3.5"/>Reject</button>
                      </>
                    )}
                    <button onClick={() => deleteSub(sub.id)} className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-destructive transition-colors hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "applications" && !loading && (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-3 font-[family-name:var(--font-heading)] text-lg font-semibold lowercase">
                applications
                <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{pendingApps} pending</span>
              </h2>
              <button onClick={() => void loadData()} className="btn-ghost rounded-full px-3 py-1.5 text-xs">Refresh</button>
            </div>
            <div className="surface-card mb-5 p-5">
              <h3 className="mb-1 font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">invite a contributor directly</h3>
              <p className="mb-4 text-xs text-muted-foreground">For people who didn&apos;t go through /join. This is the only correct way to add someone outside the normal application flow &mdash; adding them directly in Supabase will not work. If they already have an unused invite, sending again replaces it instantly &mdash; any older email link they have stops working.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={directInviteName} onChange={e => setDirectInviteName(e.target.value)} placeholder="Full name" className="glass-input flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                <input value={directInviteEmail} onChange={e => setDirectInviteEmail(e.target.value)} placeholder="email@example.com" type="email" className="glass-input flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none" />
                <button onClick={handleDirectInvite} disabled={sendingDirectInvite || directInviteName.trim().length < 2 || !directInviteEmail.trim()}
                  className="btn-primary shrink-0 rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50">
                  {sendingDirectInvite ? "Sending..." : "Send invite"}
                </button>
              </div>
              {directInviteNotice && <p className="mt-3 text-xs text-success">{directInviteNotice}</p>}
            </div>
            {applications.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No applications yet.</div>
            ) : (
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {applicationSections.map(section => (
                    <button
                      key={section.key}
                      onClick={() => setApplicationFilter(section.key)}
                      className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors ${applicationFilter === section.key ? "border-accent bg-accent/10 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent/30"}`}
                    >
                      {section.label} ({section.items.length})
                    </button>
                  ))}
                </div>
                {(() => {
                  const active = applicationSections.find(section => section.key === applicationFilter) || applicationSections[0]
                  return active.items.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">None in this section.</div>
                  ) : (
                    <div className="space-y-3">{active.items.map(renderApplicationCard)}</div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === "groups" && !loading && (
          <div className="mt-0">
            <div className="surface-card mb-5 p-5">
              <h3 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">create new group</h3>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Group Name *</label>
                  <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Team Alpha" className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description</label>
                  <input value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What will this group build?" className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                </div>
              </div>
              <div className="mb-3">
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Add Members</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allContribs.map((c: any) => {
                    const isSel = selectedMembers.some((m: any) => m.id === c.codyza_id)
                    return (
                      <button key={c.codyza_id} type="button"
                        onClick={() => isSel ? setSelectedMembers((p: any) => p.filter((m: any) => m.id !== c.codyza_id)) : setSelectedMembers((p: any) => [...p, {id: c.codyza_id, role: "member"}])}
                        className={`rounded-lg border px-3 py-1 text-xs transition-colors ${isSel ? "border-accent/50 bg-accent/10 text-accent" : "border-border bg-muted text-muted-foreground hover:border-accent/30"}`}>
                        {c.name}
                      </button>
                    )
                  })}
                </div>
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((m: any) => {
                      const c = allContribs.find((x: any) => x.codyza_id === m.id)
                      return (
                        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-2 py-1">
                          <span className="text-xs text-foreground">{c?.name}</span>
                          <select value={m.role} onChange={e => setSelectedMembers((p: any) => p.map((sm: any) => sm.id === m.id ? {...sm, role: e.target.value} : sm))} className="border-none bg-transparent text-xs text-accent outline-none">
                            {["member","pm","frontend","backend","design","devops","ai"].map(r => <option key={r} value={r} className="bg-card">{r}</option>)}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <button disabled={creatingGroup || !newGroupName}
                onClick={async () => {
                  setCreatingGroup(true)
                  setError("")
                  try {
                    const response = await adminFetch("/api/groups", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newGroupName,description:newGroupDesc,member_ids:selectedMembers.map((m:any)=>m.id),roles:selectedMembers.map((m:any)=>m.role)})})
                    await requireSuccessfulResponse(response, "Group could not be created")
                    setNewGroupName(""); setNewGroupDesc(""); setSelectedMembers([])
                    await loadData()
                  } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Group could not be created") }
                  finally { setCreatingGroup(false) }
                }}
                className="btn-primary rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50">
                {creatingGroup ? "Creating..." : "Create Group"}
              </button>
            </div>
            <div className="space-y-3">
              {groups.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No groups yet.</p> : groups.map((g: any) => (
                <div key={g.id} className="surface-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{g.name}</span>
                      <select
                        value={g.status}
                        onChange={async (e) => {
                          const status = e.target.value
                          setError("")
                          try {
                            const response = await adminFetch("/api/groups", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: g.id, status }) })
                            await requireSuccessfulResponse(response, "Group status could not be updated")
                            await loadData()
                          } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Group status could not be updated") }
                        }}
                        className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground focus:outline-none"
                      >
                        {["planning","building","review","submitted","live"].map(s => <option key={s} value={s} className="bg-card">{s}</option>)}
                      </select>
                    </div>
                    <span className="text-xs text-muted-foreground">{g.members?.length || 0} members</span>
                  </div>
                  {g.description && <p className="mb-2 text-xs text-muted-foreground">{g.description}</p>}
                  <div className="flex flex-wrap gap-1.5">{(g.members||[]).map((m:any) => (<span key={m.codyza_id} className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{m.name} · <span className="text-accent">{m.role}</span></span>))}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bounties" && !loading && (
          <div className="mt-0">
            <div className="surface-card mb-5 p-5">
              <h3 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold lowercase">post new bounty</h3>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Title *</label>
                    <input value={newBountyTitle} onChange={e => setNewBountyTitle(e.target.value)} placeholder="e.g. Add GitHub activity chart" className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">XP Reward</label>
                      <input type="number" value={newBountyXP} onChange={e => setNewBountyXP(Number(e.target.value))} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tech Tags</label>
                      <input value={newBountyTags} onChange={e => setNewBountyTags(e.target.value)} placeholder="React, CSS" className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description *</label>
                <textarea value={newBountyDesc} onChange={e => setNewBountyDesc(e.target.value)} placeholder="What needs to be built? Be specific." rows={3} className="glass-input w-full resize-none px-3 py-2 text-sm focus:outline-none"/>
              </div>
              <button disabled={creatingBounty || !newBountyTitle || !newBountyDesc}
                onClick={async () => {
                  setCreatingBounty(true)
                  setError("")
                  try {
                    const response = await adminFetch("/api/bounties", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:newBountyTitle,description:newBountyDesc,xp_reward:newBountyXP,tech_tags:newBountyTags.split(",").map((t:string)=>t.trim()).filter(Boolean)})})
                    await requireSuccessfulResponse(response, "Bounty could not be posted")
                    setNewBountyTitle(""); setNewBountyDesc(""); setNewBountyXP(100); setNewBountyTags("")
                    await loadData()
                  } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Bounty could not be posted") }
                  finally { setCreatingBounty(false) }
                }}
                className="btn-accent rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50">
                {creatingBounty ? "Posting..." : "Post Bounty"}
              </button>
            </div>
            <div className="space-y-3">
              {bounties.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No bounties yet.</p> : bounties.map((b: any) => (
                <div key={b.id} className="surface-card p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold">{b.title}</span>
                    <div className="flex items-center gap-3"><span className="text-sm font-bold text-accent">+{b.xp_reward} XP</span><span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${b.status==="open"?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{b.status}</span></div>
                  </div>
                  <p className="mb-1 text-xs text-muted-foreground">{b.description}</p>
                  <span className="text-xs text-muted-foreground">By {b.poster_name}{b.claimer_name?` · Claimed by ${b.claimer_name}`:""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sessions" && !loading && (
          <div className="mt-0 space-y-4">
            <div className="surface-card flex flex-wrap items-end gap-3 p-4">
              <div className="min-w-[10rem] flex-1">
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Clock in a member</label>
                <select value={clockInCodyzaId} onChange={e => setClockInCodyzaId(e.target.value)} className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select contributor</option>
                  {contributors.map(c => <option key={c.id} value={c.codyza_id}>{c.name} · {c.codyza_id}</option>)}
                </select>
              </div>
              <div className="min-w-[10rem] flex-1">
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Label (optional)</label>
                <input type="text" value={clockInLabel} onChange={e => setClockInLabel(e.target.value)} placeholder="What are they working on?" className="glass-input w-full rounded-xl px-3 py-2 text-sm focus:outline-none"/>
              </div>
              <button onClick={adminClockIn} disabled={!clockInCodyzaId || clockingIn} className="btn-primary rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50">
                {clockingIn ? "Clocking in..." : "Clock in"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => { setSessionView("all"); setSessionPersonFilter(null) }} className={`rounded-full px-3 py-1.5 text-xs font-medium ${sessionView === "all" ? "bg-accent text-white" : "btn-ghost"}`}>All sessions</button>
              <button onClick={() => setSessionView("by-person")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${sessionView === "by-person" ? "bg-accent text-white" : "btn-ghost"}`}>By person</button>
              {sessionPersonFilter && (
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {sessionPersonFilter}
                  <button onClick={() => setSessionPersonFilter(null)} className="text-foreground">✕</button>
                </span>
              )}
            </div>

            {sessionView === "by-person" ? (
              sessionStatsByPerson.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No completed sessions yet.</p>
              ) : (
                <div className="space-y-2">
                  {sessionStatsByPerson.map(person => (
                    <button
                      key={person.codyza_id}
                      onClick={() => { setSessionPersonFilter(person.codyza_id); setSessionView("all") }}
                      className="surface-card flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.count} session{person.count === 1 ? "" : "s"} · last active {new Date(person.lastActive).toLocaleDateString()}</p>
                      </div>
                      <div className="flex shrink-0 gap-6 text-right">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
                          <p className="text-sm font-bold text-accent">{formatSessionDuration(person.totalMinutes)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Average</p>
                          <p className="text-sm font-bold">{formatSessionDuration(Math.round(person.totalMinutes / person.count))}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : visibleSessions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No sessions logged yet.</p>
            ) : (
              <div className="space-y-3">
                {visibleSessions.map((s: any) => {
                  const overCap = s.status === "completed" && (s.duration_minutes || 0) > MAX_SESSION_MINUTES
                  return (
                    <div key={s.id} className="surface-card p-4">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{s.member_name}</span>
                        <div className="flex shrink-0 items-center gap-2">
                          {s.status === "active" ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-success">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Active
                            </span>
                          ) : (
                            <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${overCap ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                              {s.duration_minutes ? formatSessionDuration(s.duration_minutes) : "—"}
                            </span>
                          )}
                          {s.edited_by_admin && (
                            <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">edited</span>
                          )}
                          {s.status === "active" && (
                            <button onClick={() => adminClockOut(s.id)} disabled={processingSessionId === s.id} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50">
                              {processingSessionId === s.id ? "..." : "Clock out"}
                            </button>
                          )}
                          <button onClick={() => setEditingSession(s)} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Edit</button>
                        </div>
                      </div>
                      <p className="mb-1 text-xs text-muted-foreground">
                        Started {new Date(s.started_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        {s.label ? ` · ${s.label}` : ""}
                      </p>
                      {s.summary && <p className="text-xs text-muted-foreground">{s.summary}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {editingContributor && (
        <EditModal contributor={editingContributor} onClose={() => setEditingContributor(null)} onSave={saveContributor} saving={savingEdit}/>
      )}
      {editingSession && (
        <SessionEditModal session={editingSession} onClose={() => setEditingSession(null)} onSave={saveSessionEdit} saving={savingSessionEdit}/>
      )}
    </div>
  )
}
