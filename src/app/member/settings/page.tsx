"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Check } from "lucide-react"

const SKILL_OPTIONS = [
  "React","Next.js","TypeScript","JavaScript","Python","Node.js",
  "Tailwind CSS","PostgreSQL","MongoDB","Supabase","Prisma","GraphQL",
  "REST API","Docker","AWS","Vercel","Cloudflare","Gemini AI","OpenAI",
  "Claude API","React Native","Vue.js","Django","FastAPI","Rust","Go",
  "Figma","UI/UX","DevOps","Kubernetes","Redis","Firebase"
]

export default function SettingsPage() {
  const router = useRouter()
  const [contributor, setContributor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [github, setGithub] = useState("")
  const [role, setRole] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])

  useEffect(() => { loadUser() }, [])

  const loadUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }
    const { data } = await supabase.from("contributors").select("*").eq("email", user.email).single()
    if (data) {
      setContributor(data)
      setName(data.name || "")
      setGithub(data.github || "")
      setRole(data.role || "")
      setBio(data.bio || "")
      setSkills(data.skills || [])
    }
    setLoading(false)
  }

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) setSkills(skills.filter(s => s !== skill))
    else if (skills.length < 12) setSkills([...skills, skill])
  }

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false)
    try {
      const res = await fetch("/api/member/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codyza_id: contributor.codyza_id, name, github, role, bio, skills }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to save"); setSaving(false); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { setError("Network error") }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/member" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Hub
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Profile Settings</h1>
        <p className="text-gray-400 text-sm">{contributor?.codyza_id} · {contributor?.email}</p>
      </div>

      <div className="space-y-6">

        {/* Basic info */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px 22px" }}>
          <h2 className="text-sm font-mono uppercase tracking-wider text-gray-400 mb-5">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Your name"/>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">GitHub Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">github.com/</span>
                <input type="text" value={github} onChange={e => setGithub(e.target.value)}
                  className="w-full pl-28 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="username"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Role / Title</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g. Full Stack Developer"/>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-500 mb-2">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="A short bio — what you build, what you care about..."/>
            </div>
          </div>
        </div>

        {/* Skill tags */}
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px 22px" }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-mono uppercase tracking-wider text-gray-400">Skills</h2>
            <span className="text-xs text-gray-500">{skills.length}/12 selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  skills.includes(skill)
                    ? "bg-purple-500/25 border border-purple-500/60 text-purple-300 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/25 hover:text-white"
                }`}>
                {skill}
              </button>
            ))}
          </div>
          {skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 mb-2">Selected:</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm px-1">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: saved ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg,#7c3aed,#2563eb)", border: saved ? "1px solid rgba(34,197,94,0.4)" : "none", color: saved ? "#22c55e" : "#fff" }}>
          {saving ? "Saving..." : saved ? <><Check className="w-4 h-4"/> Saved!</> : <><Save className="w-4 h-4"/> Save Changes</>}
        </button>
      </div>
    </div>
  )
}
