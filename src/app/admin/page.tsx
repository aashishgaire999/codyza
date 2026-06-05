"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Shield, Users, FileText, TrendingUp, CheckCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"


interface Contributor {
  id: string; codyza_id: string; name: string; email: string; github: string
  role: string; level: string; xp: number; rank: string; streak: number; joined_at: string
}
interface Submission {
  id: string; codyza_id: string; project_name: string; github_url: string
  live_url: string | null; description: string; tech_stack: string[]
  ai_score: number | null; xp_earned: number; status: string; submitted_at: string
}

const RANKS = ["Apprentice","Associate Engineer","Software Engineer","Senior Engineer","Staff Engineer","Principal Engineer","Distinguished Engineer","Codyza Fellow"]

function EditModal({ contributor, onClose, onSave, saving }: { contributor: Contributor; onClose: () => void; onSave: (u: Partial<Contributor>) => void; saving: boolean }) {
  const [name, setName] = useState(contributor.name)
  const [email, setEmail] = useState(contributor.email)
  const [github, setGithub] = useState(contributor.github || "")
  const [role, setRole] = useState(contributor.role || "")
  const [level, setLevel] = useState(contributor.level || "")
  const [xp, setXp] = useState(contributor.xp)
  const [rank, setRank] = useState(contributor.rank)
  const [streak, setStreak] = useState(contributor.streak)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a14] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit {contributor.codyza_id}</h2>
          <button onClick={onClose} disabled={saving} className="text-zinc-500 hover:text-white">✕</button>
        </div>
        <div className="space-y-4">
          {[["Name","text",name,setName],["Email","email",email,setEmail],["GitHub","text",github,setGithub],["Role","text",role,setRole],["Level","text",level,setLevel]].map(([label,type,val,setter]: any) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-500">{label}</label>
              <input type={type} value={val} onChange={e => setter(e.target.value)} className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-500">Rank</label>
            <select value={rank} onChange={e => setRank(e.target.value)} className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
              {RANKS.map(r => <option key={r} value={r} className="bg-[#0a0a14]">{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-500">XP</label>
              <input type="number" value={xp} onChange={e => setXp(Number(e.target.value))} className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
            </div>
            <div>
              <label className="mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-500">Streak</label>
              <input type="number" value={streak} onChange={e => setStreak(Number(e.target.value))} className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={saving} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={() => onSave({name,email,github,role,level,xp,rank,streak})} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("admin_auth") === "true"
    return false
  })
  const [accessCode, setAccessCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview"|"contributors"|"submissions"|"applications"|"groups"|"bounties">("overview")
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [bounties, setBounties] = useState<any[]>([])
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
  const [bulkActioning, setBulkActioning] = useState(false)
  const [processingApp, setProcessingApp] = useState<string | null>(null)

  const loadApplications = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("applications").select("*").order("applied_at", { ascending: false })
    if (data) setApplications(data)
  }

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: contribData } = await supabase.from("contributors").select("*").order("xp", { ascending: false })
    const { data: subData } = await supabase.from("submissions").select("*").order("submitted_at", { ascending: false })
    setContributors(contribData || [])
    setAllContribs(contribData || [])
    setSubmissions(subData || [])
    const [gr, bo] = await Promise.all([
      fetch("/api/groups").then(r => r.json()),
      fetch("/api/bounties").then(r => r.json()),
    ])
    setGroups(Array.isArray(gr) ? gr : [])
    setBounties(Array.isArray(bo) ? bo : [])
    setLoading(false)
    loadApplications()
  }

  const handleLogin = async () => {
    setVerifying(true); setError("")
    try {
      const res = await fetch("/api/admin/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ accessCode }) })
      const data = await res.json()
      if (data.valid) { setIsAuthenticated(true); sessionStorage.setItem("admin_auth", "true"); loadData() }
      else setError("Invalid access code")
    } catch { setError("Network error. Please try again.") }
    finally { setVerifying(false) }
  }

  const updateSubStatus = async (id: string, status: "approved"|"rejected") => {
    const supabase = createClient()
    await supabase.from("submissions").update({ status }).eq("id", id)

    // Get submission details
    const { data: sub } = await supabase
      .from("submissions")
      .select("codyza_id, project_name, xp_earned")
      .eq("id", id)
      .single()

    if (sub) {
      // Award XP to contributor when approved
      if (status === "approved" && sub.xp_earned > 0) {
        const { data: contrib } = await supabase
          .from("contributors")
          .select("xp")
          .eq("codyza_id", sub.codyza_id)
          .single()

        if (contrib) {
          const newXP = (contrib.xp || 0) + sub.xp_earned
          // Calculate new rank
          const RANKS = [
            { name: "Apprentice", minXP: 0 },
            { name: "Associate Engineer", minXP: 500 },
            { name: "Software Engineer", minXP: 1500 },
            { name: "Senior Engineer", minXP: 3500 },
            { name: "Staff Engineer", minXP: 7000 },
            { name: "Principal Engineer", minXP: 12000 },
            { name: "Distinguished Engineer", minXP: 20000 },
            { name: "Codyza Fellow", minXP: 35000 },
          ]
          let newRank = "Apprentice"
          for (const r of RANKS) { if (newXP >= r.minXP) newRank = r.name }
          await supabase.from("contributors").update({ xp: newXP, rank: newRank }).eq("codyza_id", sub.codyza_id)
        }
      }

      // Fire notification
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codyza_id: sub.codyza_id,
          type: status === "approved" ? "submission_approved" : "submission_rejected",
          message: status === "approved"
            ? `Your project "${sub.project_name}" was approved! +${sub.xp_earned} XP added.`
            : `Your project "${sub.project_name}" was not approved this time.`,
          link: "/member/projects",
        }),
      })
    }
    loadData()
  }

  const deleteSub = async (id: string) => {
    if (!confirm("Delete this submission?")) return
    const supabase = createClient()
    await supabase.from("submissions").delete().eq("id", id)
    loadData()
  }

  const saveContributor = async (updates: Partial<Contributor>) => {
    if (!editingContributor) return
    setSavingEdit(true)
    const supabase = createClient()
    const { error } = await supabase.from("contributors").update(updates).eq("id", editingContributor.id)
    setSavingEdit(false)
    if (error) { alert("Failed: " + error.message); return }
    setEditingContributor(null); loadData()
  }

  const deleteContributor = async (id: string) => {
    if (!confirm("Delete this contributor and all their submissions?")) return
    const supabase = createClient()
    await supabase.from("contributors").delete().eq("codyza_id", id)
    await supabase.from("submissions").delete().eq("codyza_id", id)
    loadData()
  }

  const bulkUpdate = async (status: "approved"|"rejected") => {
    if (selected.size === 0) return
    if (status === "rejected" && !confirm(`Reject ${selected.size} submissions?`)) return
    setBulkActioning(true)
    const supabase = createClient()
    await supabase.from("submissions").update({ status }).in("id", Array.from(selected))
    setBulkActioning(false); setSelected(new Set()); loadData()
  }

  const handleApplication = async (id: string, action: "approve"|"decline") => {
    setProcessingApp(id)
    try {
      const res = await fetch("/api/admin/invite", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ application_id: id, action }) })
      if (res.ok) setApplications(prev => prev.map(a => a.id === id ? { ...a, status: action === "approve" ? "approved" : "declined" } : a))
    } catch(e) { console.error(e) }
    setProcessingApp(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 mb-6">Enter your access code to continue</p>
          <input type="password" value={accessCode} onChange={e => setAccessCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Access Code"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 mb-4"/>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={handleLogin} disabled={verifying}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {verifying ? "Verifying..." : "Access Dashboard"}
          </button>
          <Link href="/" className="block text-center text-gray-400 text-sm mt-4 hover:text-white transition-colors">← Back to Codyza</Link>
        </div>
      </div>
    )
  }

  const totalXP = contributors.reduce((sum, c) => sum + c.xp, 0)
  const pendingCount = submissions.filter(s => s.status === "pending").length
  const pendingApps = applications.filter(a => a.status === "pending").length

  return (
    <div className="min-h-screen bg-transparent text-white">
      <nav style={{background:"rgba(15,12,26,0.8)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none"}}>
            <img src="/codyza-logo.png" alt="Codyza" style={{width:28,height:28,borderRadius:6}} onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}}/>
            <span style={{fontWeight:800,fontSize:15,color:"#f8fafc"}}>Codyza</span>
          </a>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginLeft:4}}>Admin</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <a href="/member" style={{fontSize:13,color:"rgba(255,255,255,0.5)",textDecoration:"none",padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)"}}>← Member Hub</a>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <a href="/admin/analytics" className="ml-auto text-sm text-purple-400 hover:text-purple-300 transition-colors">Analytics →</a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-purple-400"/><span className="text-gray-400 text-sm">Contributors</span></div>
            <p className="text-3xl font-bold">{contributors.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><FileText className="w-4 h-4 text-blue-400"/><span className="text-gray-400 text-sm">Submissions</span></div>
            <p className="text-3xl font-bold">{submissions.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-yellow-400"/><span className="text-gray-400 text-sm">Total XP</span></div>
            <p className="text-3xl font-bold">{totalXP.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-900/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-orange-400"/><span className="text-gray-400 text-sm">Applications</span></div>
            <p className="text-3xl font-bold">{pendingApps}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10 pb-0">
          {(["overview","contributors","submissions","applications","groups","bounties"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-colors capitalize text-sm ${activeTab === tab ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"}`}>
              {tab === "submissions" ? `Submissions (${pendingCount})` : tab === "applications" ? `Applications (${pendingApps})` : tab === "contributors" ? `Contributors (${contributors.length})` : tab === "groups" ? `Groups (${groups.length})` : tab === "bounties" ? `Bounties (${bounties.length})` : "Overview"}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-center py-12">Loading...</p>}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && !loading && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            {submissions.slice(0,5).map(sub => (
              <div key={sub.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="font-semibold">{sub.project_name}</p>
                  <p className="text-sm text-gray-400">{sub.codyza_id} · {new Date(sub.submitted_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${sub.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : sub.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* CONTRIBUTORS TAB */}
        {activeTab === "contributors" && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["ID","Name","Email","XP","Rank","Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono uppercase tracking-wider text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contributors.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono text-sm text-purple-400">{c.codyza_id}</td>
                    <td className="py-3 px-4 font-semibold">{c.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{c.email}</td>
                    <td className="py-3 px-4 text-yellow-400 font-bold">{c.xp}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{c.rank}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingContributor(c)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"><FileText className="w-3.5 h-3.5"/></button>
                        <button onClick={() => deleteContributor(c.codyza_id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === "submissions" && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{selected.size > 0 ? `${selected.size} selected` : `${submissions.length} total`}</span>
                {selected.size === 0
                  ? <button onClick={() => setSelected(new Set(submissions.map(s => s.id)))} className="text-xs text-purple-400 hover:text-purple-300">Select all</button>
                  : <button onClick={() => setSelected(new Set())} className="text-xs text-zinc-500 hover:text-white">Clear</button>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => bulkUpdate("approved")} disabled={selected.size === 0 || bulkActioning}
                  className="flex items-center gap-1.5 rounded-lg bg-green-500/20 px-3 py-1.5 text-sm font-semibold text-green-400 hover:bg-green-500/30 disabled:opacity-40">
                  <CheckCircle className="h-4 w-4"/> Approve selected
                </button>
                <button onClick={() => bulkUpdate("rejected")} disabled={selected.size === 0 || bulkActioning}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-semibold text-red-400 hover:bg-red-500/30 disabled:opacity-40">
                  <XCircle className="h-4 w-4"/> Reject selected
                </button>
              </div>
            </div>
            {submissions.map(sub => (
              <div key={sub.id} className={`rounded-xl border p-5 transition-colors ${selected.has(sub.id) ? "border-purple-500/60 bg-purple-500/[0.06]" : "border-white/10 bg-white/5 hover:border-purple-500/30"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={selected.has(sub.id)} onChange={() => setSelected(prev => { const n = new Set(prev); n.has(sub.id) ? n.delete(sub.id) : n.add(sub.id); return n })}
                      className="mt-1.5 h-4 w-4 cursor-pointer accent-purple-500"/>
                    <div>
                      <h3 className="text-lg font-bold">{sub.project_name}</h3>
                      <p className="text-sm text-gray-400">{sub.codyza_id} · {new Date(sub.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.ai_score && <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 font-bold text-sm">{sub.ai_score}/10</span>}
                    <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 font-bold text-sm">+{sub.xp_earned} XP</span>
                    <span className={`px-2 py-1 rounded-lg text-sm ${sub.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : sub.status === "approved" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{sub.status}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{sub.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {sub.tech_stack?.map(t => <span key={t} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs">{t}</span>)}
                </div>
                <div className="flex items-center gap-4">
                  <a href={sub.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">GitHub →</a>
                  {sub.live_url && <a href={sub.live_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">Live →</a>}
                  <div className="ml-auto flex gap-2">
                    {sub.status === "pending" && (
                      <>
                        <button onClick={() => updateSubStatus(sub.id, "approved")} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors flex items-center gap-1.5 text-sm"><CheckCircle className="w-3.5 h-3.5"/>Approve</button>
                        <button onClick={() => updateSubStatus(sub.id, "rejected")} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-1.5 text-sm"><XCircle className="w-3.5 h-3.5"/>Reject</button>
                      </>
                    )}
                    <button onClick={() => deleteSub(sub.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && !loading && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-3">
                Applications
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">{pendingApps} pending</span>
              </h2>
              <button onClick={loadApplications} className="text-xs text-gray-400 border border-white/10 rounded-lg px-3 py-1.5 hover:border-white/20 hover:text-white transition-colors">Refresh</button>
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No applications yet.</div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className={`rounded-xl border p-5 ${app.status === "approved" ? "border-green-500/20 bg-green-500/[0.03]" : app.status === "declined" ? "border-red-500/10 bg-red-500/[0.02]" : "border-white/8 bg-white/[0.03]"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-bold text-base">{app.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${app.status === "pending" ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : app.status === "approved" ? "bg-green-500/10 border border-green-500/30 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>{app.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                          <span>{app.email}</span>
                          {app.github && <a href={`https://github.com/${app.github}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors">@{app.github}</a>}
                          <span>{app.role} · {app.level}</span>
                          <span className="font-mono text-xs text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                        {app.skills && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {app.skills.split(",").slice(0,6).map((s: string) => (
                              <span key={s} className="px-2 py-0.5 rounded text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400">{s.trim()}</span>
                            ))}
                          </div>
                        )}
                        {app.why && (
                          <p className="text-sm text-gray-400 bg-white/[0.02] border-l-2 border-purple-500/30 pl-3 py-2 rounded-r-lg leading-relaxed italic">&ldquo;{app.why}&rdquo;</p>
                        )}
                      </div>
                      {app.status === "pending" && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button onClick={() => handleApplication(app.id, "approve")} disabled={processingApp === app.id}
                            className="px-4 py-2 rounded-lg bg-green-500/15 border border-green-500/40 text-green-400 text-sm font-bold hover:bg-green-500/25 transition-colors disabled:opacity-50">
                            {processingApp === app.id ? "..." : "Approve ✓"}
                          </button>
                          <button onClick={() => handleApplication(app.id, "decline")} disabled={processingApp === app.id}
                            className="px-4 py-2 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/15 transition-colors disabled:opacity-50">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

        {activeTab === "groups" && !loading && (
          <div className="mt-0">
            <div className="mb-5 p-5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <h3 className="font-bold text-white mb-4 text-sm">Create New Group</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Group Name *</label>
                  <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. Team Alpha" className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                  <input value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="What will this group build?" className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Add Members</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {allContribs.map((c: any) => {
                    const isSel = selectedMembers.some((m: any) => m.id === c.codyza_id)
                    return (
                      <button key={c.codyza_id} type="button"
                        onClick={() => isSel ? setSelectedMembers((p: any) => p.filter((m: any) => m.id !== c.codyza_id)) : setSelectedMembers((p: any) => [...p, {id: c.codyza_id, role: "member"}])}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors ${isSel ? "bg-purple-500/25 border border-purple-500/50 text-purple-300" : "bg-white/[0.04] border border-white/[0.08] text-gray-500 hover:border-white/20"}`}>
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
                        <div key={m.id} className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <span className="text-xs text-purple-300">{c?.name}</span>
                          <select value={m.role} onChange={e => setSelectedMembers((p: any) => p.map((sm: any) => sm.id === m.id ? {...sm, role: e.target.value} : sm))} className="text-xs bg-transparent text-purple-400 border-none outline-none">
                            {["member","pm","frontend","backend","design","devops","ai"].map(r => <option key={r} value={r} className="bg-[#0a0a14]">{r}</option>)}
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
                  const adm = contributors.find((c: any) => c.is_admin)
                  await fetch("/api/groups", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newGroupName,description:newGroupDesc,member_ids:selectedMembers.map((m:any)=>m.id),roles:selectedMembers.map((m:any)=>m.role),created_by:adm?.codyza_id})})
                  setNewGroupName(""); setNewGroupDesc(""); setSelectedMembers([])
                  const r = await fetch("/api/groups"); setGroups(await r.json()); setCreatingGroup(false)
                }}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {creatingGroup ? "Creating..." : "Create Group"}
              </button>
            </div>
            <div className="space-y-3">
              {groups.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">No groups yet.</p> : groups.map((g: any) => (
                <div key={g.id} className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3"><span className="font-semibold text-white text-sm">{g.name}</span><span className="px-2 py-0.5 rounded-full text-xs bg-white/[0.05] border border-white/[0.08] text-gray-400">{g.status}</span></div>
                    <span className="text-xs text-gray-500">{g.members?.length || 0} members</span>
                  </div>
                  {g.description && <p className="text-xs text-gray-500 mb-2">{g.description}</p>}
                  <div className="flex flex-wrap gap-1.5">{(g.members||[]).map((m:any) => (<span key={m.codyza_id} className="px-2 py-0.5 text-[10px] rounded bg-white/[0.04] border border-white/[0.07] text-gray-400">{m.name} · <span className="text-purple-400">{m.role}</span></span>))}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bounties" && !loading && (
          <div className="mt-0">
            <div className="mb-5 p-5 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <h3 className="font-bold text-white mb-4 text-sm">Post New Bounty</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Title *</label>
                  <input value={newBountyTitle} onChange={e => setNewBountyTitle(e.target.value)} placeholder="e.g. Add GitHub activity chart" className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">XP Reward</label>
                    <input type="number" value={newBountyXP} onChange={e => setNewBountyXP(Number(e.target.value))} className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Tech Tags</label>
                    <input value={newBountyTags} onChange={e => setNewBountyTags(e.target.value)} placeholder="React, CSS" className="w-full glass-input rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Description *</label>
                <textarea value={newBountyDesc} onChange={e => setNewBountyDesc(e.target.value)} placeholder="What needs to be built? Be specific." rows={3} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"/>
              </div>
              <button disabled={creatingBounty || !newBountyTitle || !newBountyDesc}
                onClick={async () => {
                  setCreatingBounty(true)
                  const adm = contributors.find((c: any) => c.is_admin)
                  await fetch("/api/bounties", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:newBountyTitle,description:newBountyDesc,xp_reward:newBountyXP,tech_tags:newBountyTags.split(",").map((t:string)=>t.trim()).filter(Boolean),posted_by:adm?.codyza_id})})
                  setNewBountyTitle(""); setNewBountyDesc(""); setNewBountyXP(100); setNewBountyTags("")
                  const r = await fetch("/api/bounties"); setBounties(await r.json()); setCreatingBounty(false)
                }}
                className="px-5 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                {creatingBounty ? "Posting..." : "Post Bounty"}
              </button>
            </div>
            <div className="space-y-3">
              {bounties.length === 0 ? <p className="text-gray-500 text-sm text-center py-8">No bounties yet.</p> : bounties.map((b: any) => (
                <div key={b.id} className="p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-sm">{b.title}</span>
                    <div className="flex items-center gap-3"><span className="text-sm font-bold text-yellow-400">+{b.xp_reward} XP</span><span className={`px-2 py-0.5 rounded-full text-xs ${b.status==="open"?"bg-green-500/10 text-green-400":"bg-yellow-500/10 text-yellow-400"}`}>{b.status}</span></div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{b.description}</p>
                  <span className="text-xs text-gray-600">By {b.poster_name}{b.claimer_name?` · Claimed by ${b.claimer_name}`:""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {editingContributor && (
        <EditModal contributor={editingContributor} onClose={() => setEditingContributor(null)} onSave={saveContributor} saving={savingEdit}/>
      )}
    </div>
  )
}
