"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { ExternalLink, GitBranch, FileText, Send, ChevronDown, ChevronUp, Plus } from "lucide-react"
import Link from "next/link"

const TECH_OPTIONS = [
  "Next.js","React","TypeScript","Python","Node.js","Tailwind CSS",
  "MongoDB","Supabase","PostgreSQL","Prisma","GraphQL","REST API",
  "Docker","AWS","Vercel","Cloudflare","Gemini AI","OpenAI",
  "Claude API","React Native","Vue.js","Django","FastAPI","Rust","Go"
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  approved: { label: "Live", color: "#22c55e", bg: "rgba(34,197,94,0.12)", dot: "#22c55e" },
  pending:  { label: "In Review", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", dot: "#f59e0b" },
  reviewed: { label: "Building", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", dot: "#3b82f6" },
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

function getAvatarColor(id: string) {
  const colors = [
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    "linear-gradient(135deg,#22c55e,#16a34a)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#06b6d4,#0891b2)",
    "linear-gradient(135deg,#f97316,#ea580c)",
  ]
  const idx = parseInt(id.replace(/\D/g, "").slice(-1) || "0") % colors.length
  return colors[idx]
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

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      window.location.href = "/login"
      return
    }
    const [{ data: contrib }, { data: subs }, { data: contribs }] = await Promise.all([
      supabase.from("contributors").select("*").eq("email", user.email).maybeSingle(),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("contributors").select("codyza_id, name"),
    ])
    setContributor(contrib)
    const nameMap = new Map((contribs || []).map((c: any) => [c.codyza_id, c.name]))
    const enriched = (subs || []).map((s: any) => ({ ...s, member_name: nameMap.get(s.codyza_id) || s.codyza_id }))
    setProjects(enriched)
    setLoading(false)
  }

  function toggleTech(tech: string) {
    setSelectedTech(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : prev.length < 8 ? [...prev, tech] : prev)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contributor) return
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codyza_id: contributor.codyza_id,
          project_name: projectName,
          github_url: githubUrl,
          live_url: liveUrl,
          description,
          tech_stack: selectedTech,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.error || "Submission failed"); setSubmitting(false); return }
      setSubmitSuccess(true)
      setProjectName(""); setGithubUrl(""); setLiveUrl(""); setDescription(""); setSelectedTech([])
      await loadData()
      setTimeout(() => { setSubmitSuccess(false); setSubmitOpen(false) }, 3000)
    } catch {
      setSubmitError("Something went wrong. Try again.")
    }
    setSubmitting(false)
  }

  const filtered = projects.filter(p => {
    if (filter === "all") return true
    if (filter === "live") return p.status === "approved"
    if (filter === "review") return p.status === "pending"
    if (filter === "building") return p.status === "reviewed"
    if (filter === "mine") return p.codyza_id === contributor?.codyza_id
    return true
  })

  const counts = {
    all: projects.length,
    live: projects.filter(p => p.status === "approved").length,
    review: projects.filter(p => p.status === "pending").length,
    building: projects.filter(p => p.status === "reviewed").length,
    mine: projects.filter(p => p.codyza_id === contributor?.codyza_id).length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Projects</h1>
        <p className="text-gray-400 text-sm">Everything the Codyza community has shipped. Real work, real people.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* LEFT: Projects */}
        <div className="flex-1 min-w-0">
          {/* Filter tabs */}
          <div className="flex gap-1 mb-5 border-b border-white/[0.06]">
            {[
              { key: "all", label: "All" },
              { key: "live", label: "Live" },
              { key: "review", label: "In Review" },
              { key: "building", label: "Building" },
              { key: "mine", label: "My Projects" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  filter === key ? "border-purple-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs ${filter === key ? "text-purple-400" : "text-gray-600"}`}>
                  {counts[key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total projects", value: projects.length, color: "#8b5cf6" },
              { label: "Live now", value: counts.live, color: "#22c55e" },
              { label: "Contributors", value: new Set(projects.map(p => p.codyza_id)).size, color: "#06b6d4" },
              { label: "XP awarded", value: projects.reduce((s,p)=>s+(p.xp_awarded||0),0).toLocaleString(), color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">{label}</div>
                <div className="text-xl font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-48 animate-pulse bg-white/[0.03] rounded-xl border border-white/[0.06]" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-xl">
              <div className="text-4xl mb-3">⬡</div>
              <p className="text-gray-400 font-medium">No projects yet</p>
              <p className="text-gray-600 text-sm mt-1">Be the first to ship something.</p>
              <button onClick={() => setSubmitOpen(true)} className="mt-4 px-4 py-2 text-sm bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors">
                Submit your project →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((project) => {
                const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.pending
                const isOwn = project.codyza_id === contributor?.codyza_id
                return (
                  <div key={project.id} className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/[0.15] transition-all hover:-translate-y-0.5">
                    <div className="px-4 pt-4 pb-3 border-b border-white/[0.05]">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white text-sm leading-tight">{project.project_name}</h3>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: status.bg, color: status.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }}></span>
                          {status.label}
                        </div>
                      </div>
                      {project.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{project.description}</p>}
                    </div>
                    {project.tech_stack?.length > 0 && (
                      <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-white/[0.05]">
                        {project.tech_stack.slice(0,4).map((t: string) => (
                          <span key={t} className="px-2 py-0.5 text-[10px] rounded-md bg-white/[0.05] border border-white/[0.08] text-gray-400">{t}</span>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <span className="px-2 py-0.5 text-[10px] rounded-md bg-white/[0.05] border border-white/[0.08] text-gray-500">+{project.tech_stack.length-4}</span>
                        )}
                      </div>
                    )}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: getAvatarColor(project.codyza_id) }}>
                          {getInitials(project.member_name)}
                        </div>
                        <span className="text-xs text-gray-400 truncate max-w-[100px]">{project.member_name}</span>
                        {isOwn && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">you</span>}
                        {project.xp_awarded > 0 && <span className="text-xs text-yellow-400 font-semibold ml-1">+{project.xp_awarded} XP</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {project.live_url && project.status === "approved" && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors" title="Live Demo">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white transition-colors" title="GitHub">
                            <GitBranch className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {project.github_url && (
                          <a href={`${project.github_url}/blob/main/README.md`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white transition-colors" title="README">
                            <FileText className="w-3.5 h-3.5" />
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

        {/* RIGHT: Submit panel */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden sticky top-24">
            <button onClick={() => setSubmitOpen(!submitOpen)} className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">Submit your project</div>
                  <div className="text-xs text-gray-500">Earn XP + AI review</div>
                </div>
              </div>
              {submitOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {!submitOpen && (
              <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[{ label: "Base XP", value: "+100" }, { label: "Live URL", value: "+150" }, { label: "Quality", value: "+300" }, { label: "Streak", value: "+200" }].map(({ label, value }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-center">
                      <div className="text-[10px] text-gray-500">{label}</div>
                      <div className="text-sm font-bold text-yellow-400">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-purple-500/[0.07] border border-purple-500/20 rounded-lg">
                  <p className="text-[11px] text-purple-400 font-medium">🤖 Full AI code review included</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Score · Strengths · Issues · Roadmap</p>
                </div>
              </div>
            )}

            {submitOpen && (
              <div className="border-t border-white/[0.06] px-5 py-4">
                {submitSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">✓</span>
                    </div>
                    <p className="text-sm font-semibold text-green-400">Submitted!</p>
                    <p className="text-xs text-gray-500 mt-1">Your project is under review.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Project name *</label>
                      <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="My awesome project" className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder:text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">GitHub URL *</label>
                      <input type="url" required value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder:text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Live URL <span className="text-green-400">+150 XP</span></label>
                      <input type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://myproject.vercel.app" className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder:text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Description *</label>
                      <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="What does it do? What problem does it solve?" rows={3} className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder:text-gray-600 resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Tech stack <span className="text-gray-600">(up to 8)</span></label>
                      <div className="flex flex-wrap gap-1.5">
                        {TECH_OPTIONS.map(tech => (
                          <button key={tech} type="button" onClick={() => toggleTech(tech)} className={`px-2 py-0.5 rounded text-[11px] transition-colors ${selectedTech.includes(tech) ? "bg-purple-500/25 border border-purple-500/50 text-purple-300" : "bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:border-white/20"}`}>
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                    {submitError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{submitError}</p>}
                    <button type="submit" disabled={submitting} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      {submitting ? "Getting AI Review..." : "Submit & Get AI Review"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
