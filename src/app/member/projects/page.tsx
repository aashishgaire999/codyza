"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase"
import { ExternalLink, GitBranch, FileText, Send, ChevronDown, ChevronUp, Plus, CheckCircle } from "lucide-react"
import { MemberPageHeader } from "@/components/member/member-page-header"
import { memberFetch } from "@/lib/member-fetch"

const TECH_OPTIONS = [
  "Next.js","React","TypeScript","Python","Node.js","Tailwind CSS",
  "MongoDB","Supabase","PostgreSQL","Prisma","GraphQL","REST API",
  "Docker","AWS","Vercel","Cloudflare","Gemini AI","OpenAI",
  "Claude API","React Native","Vue.js","Django","FastAPI","Rust","Go"
]

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  approved: { label: "Live", badge: "bg-success/10 text-success", dot: "bg-success" },
  pending:  { label: "In Review", badge: "bg-accent/10 text-accent", dot: "bg-accent" },
  rejected: { label: "Not approved", badge: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

function getAvatarColor(id: string) {
  const classes = [
    "bg-accent/20 text-accent",
    "bg-muted text-foreground",
    "bg-success/20 text-success",
    "bg-accent/15 text-accent",
    "bg-muted text-accent",
    "bg-success/15 text-success",
  ]
  const idx = parseInt(id.replace(/\D/g, "").slice(-1) || "0") % classes.length
  return classes[idx]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [submitOpen, setSubmitOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [liveUrl, setLiveUrl] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [expandedAi, setExpandedAi] = useState<Set<string>>(new Set())
  const [customTech, setCustomTech] = useState("")
  const [myGroupIds, setMyGroupIds] = useState<Set<string>>(new Set())
  const [claimedBounty, setClaimedBounty] = useState<{ id: string; title: string; xp_reward: number } | null>(null)

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      window.location.href = "/login"
      return
    }
    const [{ data: contrib }, { data: subs }, { data: contribs }, groupsRes] = await Promise.all([
      supabase.from("contributors").select("*").eq("email", user.email).maybeSingle(),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("contributors").select("codyza_id, name, avatar_url"),
      memberFetch("/api/groups"),
    ])
    setContributor(contrib)
    const nameMap = new Map((contribs || []).map((c: any) => [c.codyza_id, c.name]))
    const avatarMap = new Map((contribs || []).map((c: any) => [c.codyza_id, c.avatar_url]))
    const enriched = (subs || []).map((s: any) => ({ ...s, member_name: nameMap.get(s.codyza_id) || s.codyza_id, member_avatar: avatarMap.get(s.codyza_id) || "" }))
    setProjects(enriched)
    // group_members isn't readable client-side, so figure out which groups the
    // viewer belongs to via the API instead -- that's how a group submission
    // gets treated as "yours" for every member, not just whoever clicked submit.
    const groupsData = await groupsRes.json().catch(() => [])
    setMyGroupIds(new Set(
      (Array.isArray(groupsData) ? groupsData : [])
        .filter((g: any) => g.members?.some((m: any) => m.codyza_id === contrib?.codyza_id))
        .map((g: any) => g.id)
    ))

    // Arriving from "Submit for this bounty" on the bounties page -- prefill
    // and open the form. This is UX only: the server independently re-checks
    // that the claim actually belongs to this member before it counts.
    const bountyParam = new URLSearchParams(window.location.search).get("bounty")
    if (bountyParam && contrib) {
      const bountiesRes = await memberFetch("/api/bounties")
      const bounties = await bountiesRes.json().catch(() => [])
      const claimed = Array.isArray(bounties)
        ? bounties.find((b: any) => b.id === bountyParam && b.claimed_by === contrib.codyza_id && b.status === "claimed")
        : null
      if (claimed) {
        setClaimedBounty({ id: claimed.id, title: claimed.title, xp_reward: claimed.xp_reward })
        setSubmitOpen(true)
      }
    }

    setLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  function toggleTech(tech: string) {
    setSelectedTech(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : prev.length < 8 ? [...prev, tech] : prev)
  }

  function addCustomTech() {
    const tag = customTech.trim().slice(0, 40)
    if (!tag || selectedTech.length >= 8 || selectedTech.some(t => t.toLowerCase() === tag.toLowerCase())) return
    setSelectedTech(prev => [...prev, tag])
    setCustomTech("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contributor) return
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await memberFetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          github_url: githubUrl,
          live_url: liveUrl,
          description,
          tech_stack: selectedTech,
          bounty_id: claimedBounty?.id || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || "Submission failed"); setSubmitting(false); return }
      setSubmitSuccess(true)
      setProjectName(""); setGithubUrl(""); setLiveUrl(""); setDescription(""); setSelectedTech([]); setClaimedBounty(null)
      await loadData()
      setTimeout(() => { setSubmitSuccess(false); setSubmitOpen(false) }, 3000)
    } catch {
      setSubmitError("Something went wrong. Try again.")
    }
    setSubmitting(false)
  }

  const isMine = (p: any) => p.codyza_id === contributor?.codyza_id || (p.group_id && myGroupIds.has(p.group_id))

  const filtered = projects.filter(p => {
    if (filter === "all") return true
    if (filter === "live") return p.status === "approved"
    if (filter === "review") return p.status === "pending"
    if (filter === "rejected") return p.status === "rejected"
    if (filter === "mine") return isMine(p)
    return true
  })

  const counts = {
    all: projects.length,
    live: projects.filter(p => p.status === "approved").length,
    review: projects.filter(p => p.status === "pending").length,
    rejected: projects.filter(p => p.status === "rejected").length,
    mine: projects.filter(isMine).length,
  }

  return (
    <>
      <MemberPageHeader
        label="member · projects"
        title={
          <>
            community <span className="text-accent">projects</span>
          </>
        }
        description="Everything members have submitted — live, in review, or still building."
      />

      {/* Submit CTA — mobile only (above the list) */}
      <div className="mb-5 lg:hidden">
        <div className="surface-card overflow-hidden">
          <button onClick={() => setSubmitOpen(!submitOpen)} className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/10">
                <Plus className="h-4 w-4 text-accent" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">Submit your project</div>
                <div className="text-xs text-muted-foreground">Submit any project for review</div>
              </div>
            </div>
            {submitOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {submitOpen && (
            <div className="border-t border-border px-5 py-4">
              {submitSuccess ? (
                <div className="animate-in fade-in zoom-in-95 py-6 text-center duration-500 ease-out">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-success/25 bg-success/10">
                    <CheckCircle className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-base font-bold lowercase text-foreground">shipped.</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Admin review is next — XP lands on approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <p className="rounded-xl border border-accent/15 bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
                    {claimedBounty
                      ? <>Completing bounty <strong className="text-foreground">{claimedBounty.title}</strong> — +{claimedBounty.xp_reward} XP on approval.</>
                      : "No bounty required. Share anything you built and the team will review it."}
                  </p>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Project name *</label>
                    <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My awesome project" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GitHub URL *</label>
                    <input type="url" required value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Live URL <span className="text-success">+150 XP</span></label>
                    <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://myproject.vercel.app" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description *</label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="What does it do? What problem does it solve?" rows={3} className="glass-input w-full resize-none px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tech stack <span className="normal-case tracking-normal text-muted-foreground">(up to 8)</span></label>
                    <div className="mb-1.5 flex flex-wrap gap-1.5">
                      {Array.from(new Set([...TECH_OPTIONS, ...selectedTech])).map(tech => (
                        <button key={tech} type="button" onClick={() => toggleTech(tech)} className={`rounded px-2 py-0.5 text-[11px] transition-colors ${selectedTech.includes(tech) ? "border border-accent/50 bg-accent/15 text-accent" : "border border-border bg-muted text-muted-foreground hover:border-accent/30"}`}>
                          {tech}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input type="text" value={customTech} onChange={e => setCustomTech(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomTech() } }}
                        placeholder="Other tech not listed..." className="glass-input flex-1 px-2 py-1 text-[11px] focus:outline-none" />
                      <button type="button" onClick={addCustomTech} className="rounded border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent/30">Add</button>
                    </div>
                  </div>
                  {submitError && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">{submitError}</p>}
                  <button type="submit" disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold disabled:opacity-50">
                    {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Send className="h-4 w-4" />}
                    {submitting ? "Submitting..." : "Submit for review"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* LEFT: Projects */}
        <div className="min-w-0 flex-1">
          {/* Filter tabs */}
          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border scrollbar-none">
            {[
              { key: "all", label: "All" },
              { key: "live", label: "Live" },
              { key: "review", label: "In Review" },
              { key: "rejected", label: "Not approved" },
              { key: "mine", label: "My Projects" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  filter === key ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs ${filter === key ? "text-accent" : "text-muted-foreground"}`}>
                  {counts[key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total projects", value: projects.length },
              { label: "Live now", value: counts.live },
              { label: "Contributors", value: new Set(projects.map(p => p.codyza_id)).size },
              { label: "XP awarded", value: projects.filter(p => p.status === "approved").reduce((sum, project) => sum + (project.xp_earned || 0), 0).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="arcade-stat">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
                <div className="font-[family-name:var(--font-heading)] text-xl font-bold text-accent">{value}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1,2,3,4].map(i => <div key={i} className="surface-card h-48 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="surface-card border-dashed py-16 text-center">
              <div className="mb-3 text-4xl">⬡</div>
              <p className="font-medium text-muted-foreground">No projects yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to ship something.</p>
              <button onClick={() => setSubmitOpen(true)} className="btn-accent mt-4 rounded-full px-4 py-2 text-sm">
                Submit your project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((project) => {
                const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending
                const isOwn = project.codyza_id === contributor?.codyza_id
                // Group submissions show the AI review to every member, not just
                // whoever clicked submit -- everyone on the team earned that XP.
                const canSeeReview = isOwn || (project.group_id && myGroupIds.has(project.group_id))
                return (
                  <div key={project.id} className="surface-card overflow-hidden transition-all hover:-translate-y-0.5">
                    <div className="border-b border-border px-4 pb-3 pt-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold leading-tight text-foreground">{project.project_name}</h3>
                        <div className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </div>
                      </div>
                      {project.description && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description}</p>}
                    </div>
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2">
                        {project.tech_stack.slice(0,4).map((t: string) => (
                          <span key={t} className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">+{project.tech_stack.length-4}</span>
                        )}
                      </div>
                    )}
                    {canSeeReview && project.review_reason && (
                      <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">Admin note: {project.review_reason}</p>
                    )}
                    {canSeeReview && (project.ai_review?.summary || project.ai_review?.feedback || project.ai_feedback) && (
                      <div className="border-b border-border px-4 py-2">
                        <button
                          onClick={() => setExpandedAi(prev => { const n = new Set(prev); n.has(project.id) ? n.delete(project.id) : n.add(project.id); return n })}
                          className="flex items-center gap-1.5 text-xs font-medium text-accent hover:opacity-80"
                        >
                          {project.ai_score && <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-bold">{project.ai_score}/10</span>}
                          {expandedAi.has(project.id) ? "Hide AI review ▲" : "View your AI review ▼"}
                        </button>
                        {expandedAi.has(project.id) && (
                          <div className="mt-2 space-y-2 rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                            {project.ai_review?.one_liner && <p className="font-semibold text-foreground">{project.ai_review.one_liner}</p>}
                            {project.ai_review?.summary && <p>{project.ai_review.summary}</p>}
                            {(project.ai_review?.feedback || project.ai_feedback) && <p>{project.ai_review?.feedback || project.ai_feedback}</p>}
                            {!!project.ai_review?.strengths?.length && (
                              <div>
                                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-success">Strengths</p>
                                <ul className="list-inside list-disc space-y-0.5">{project.ai_review.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                              </div>
                            )}
                            {!!project.ai_review?.improvements?.length && (
                              <div>
                                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-destructive">Improvements</p>
                                <ul className="list-inside list-disc space-y-0.5">{project.ai_review.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                              </div>
                            )}
                            {!!project.ai_review?.roadmap?.length && (
                              <div>
                                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-accent">Roadmap</p>
                                <ul className="list-inside list-disc space-y-0.5">{project.ai_review.roadmap.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-border">
                          {project.member_avatar
                            ? <Image src={project.member_avatar} alt={project.member_name} fill sizes="24px" className="object-cover"/>
                            : <div className={`flex h-full w-full items-center justify-center text-[9px] font-bold ${getAvatarColor(project.codyza_id)}`}>{getInitials(project.member_name)}</div>
                          }
                        </div>
                        <span className="max-w-[100px] truncate text-xs text-muted-foreground">{project.member_name}</span>
                        {isOwn && <span className="rounded-full border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[9px] text-accent">you</span>}
                        {project.status === "approved" && project.xp_earned > 0 && <span className="ml-1 text-xs font-semibold text-accent">+{project.xp_earned} XP</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {project.live_url && project.status === "approved" && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-success/20 bg-success/10 p-1.5 text-success transition-colors hover:bg-success/20" title="Live Demo">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-muted p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="GitHub">
                            <GitBranch className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {project.github_url && (
                          <a href={`${project.github_url}/blob/main/README.md`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-muted p-1.5 text-muted-foreground transition-colors hover:text-foreground" title="README">
                            <FileText className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Submit panel — desktop only */}
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <div className="surface-card sticky top-24 overflow-hidden">
            <button onClick={() => setSubmitOpen(!submitOpen)} className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/10">
                  <Plus className="h-4 w-4 text-accent" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground">Submit your project</div>
                  <div className="text-xs text-muted-foreground">Submit any project for review</div>
                </div>
              </div>
              {submitOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {!submitOpen && (
              <div className="px-5 pb-4">
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {[{ label: "Base XP", value: "+100" }, { label: "Live URL", value: "+150" }, { label: "Approval", value: "required" }, { label: "Streak", value: "up to +200" }].map(({ label, value }) => (
                    <div key={label} className="arcade-stat px-3 py-2 text-center">
                      <div className="text-[10px] text-muted-foreground">{label}</div>
                      <div className="text-sm font-bold text-accent">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-2.5">
                  <p className="text-[11px] font-medium text-accent">🤖 Full AI code review included</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Score · Strengths · Issues · Roadmap</p>
                </div>
              </div>
            )}

            {submitOpen && (
              <div className="border-t border-border px-5 py-4">
                {submitSuccess ? (
                  <div className="animate-in fade-in zoom-in-95 py-6 text-center duration-500 ease-out">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-success/25 bg-success/10">
                      <CheckCircle className="h-7 w-7 text-success" />
                    </div>
                    <h3 className="font-[family-name:var(--font-heading)] text-base font-bold lowercase text-foreground">shipped.</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Admin review is next — XP lands on approval.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="rounded-xl border border-accent/15 bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
                      {claimedBounty
                        ? <>Completing bounty <strong className="text-foreground">{claimedBounty.title}</strong> — +{claimedBounty.xp_reward} XP on approval.</>
                        : "No bounty required. Share anything you built and the team will review it."}
                    </p>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Project name *</label>
                      <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My awesome project" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GitHub URL *</label>
                      <input type="url" required value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Live URL <span className="text-success">+150 XP</span></label>
                      <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://myproject.vercel.app" className="glass-input w-full px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Description *</label>
                      <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="What does it do? What problem does it solve?" rows={3} className="glass-input w-full resize-none px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tech stack <span className="normal-case tracking-normal text-muted-foreground">(up to 8)</span></label>
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        {Array.from(new Set([...TECH_OPTIONS, ...selectedTech])).map(tech => (
                          <button key={tech} type="button" onClick={() => toggleTech(tech)} className={`rounded px-2 py-0.5 text-[11px] transition-colors ${selectedTech.includes(tech) ? "border border-accent/50 bg-accent/15 text-accent" : "border border-border bg-muted text-muted-foreground hover:border-accent/30"}`}>
                            {tech}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input type="text" value={customTech} onChange={e => setCustomTech(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomTech() } }}
                          placeholder="Other tech not listed..." className="glass-input flex-1 px-2 py-1 text-[11px] focus:outline-none" />
                        <button type="button" onClick={addCustomTech} className="rounded border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent/30">Add</button>
                      </div>
                    </div>
                    {submitError && <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">{submitError}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold disabled:opacity-50">
                      {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Send className="h-4 w-4" />}
                      {submitting ? "Submitting..." : "Submit for review"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
