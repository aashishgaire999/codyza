"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Check } from "lucide-react"
import { AvatarUpload } from "@/components/member/avatar-upload"

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
  const [avatarUrl, setAvatarUrl] = useState<string>("")

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
      setAvatarUrl(data.avatar_url || "")
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
    <div className="flex items-center justify-center py-24">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/member" className="btn-ghost mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Link>

      <div className="mb-10 max-w-2xl">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          member · settings
        </p>
        <h1 className="headline-section font-[family-name:var(--font-heading)] lowercase text-foreground">
          profile <span className="text-accent">settings</span>
        </h1>
        <p className="mt-4 text-muted-foreground">{contributor?.codyza_id} · {contributor?.email}</p>
      </div>

      <div className="space-y-6">
        <div className="surface-card p-5 md:p-6">
          <h2 className="mb-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Basic Info</h2>
          <div className="space-y-4">
            <div className="flex justify-center pb-4">
              {contributor && (
                <AvatarUpload
                  codyzaId={contributor.codyza_id}
                  currentUrl={avatarUrl}
                  name={contributor.name}
                  onUpload={(url) => setAvatarUrl(url)}
                  size={88}
                />
              )}
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm focus:outline-none"
                placeholder="Your name"/>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GitHub Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">github.com/</span>
                <input type="text" value={github} onChange={e => setGithub(e.target.value)}
                  className="glass-input w-full py-3 pl-28 pr-4 text-sm focus:outline-none"
                  placeholder="username"/>
              </div>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Role / Title</label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm focus:outline-none"
                placeholder="e.g. Full Stack Developer"/>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="glass-input w-full resize-none px-4 py-3 text-sm focus:outline-none"
                placeholder="A short bio — what you build, what you care about..."/>
            </div>
          </div>
        </div>

        <div className="surface-card p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Skills</h2>
            <span className="text-xs text-muted-foreground">{skills.length}/12 selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  skills.includes(skill)
                    ? "border border-accent/50 bg-accent/15 text-accent"
                    : "border border-border bg-muted text-muted-foreground hover:border-accent/30 hover:text-foreground"
                }`}>
                {skill}
              </button>
            ))}
          </div>
          {skills.length > 0 && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs text-muted-foreground">Selected:</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="px-1 text-sm text-destructive">{error}</p>}

        <button onClick={handleSave} disabled={saving}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all disabled:opacity-50 ${
            saved ? "border border-success/40 bg-success/15 text-success" : "btn-primary"
          }`}>
          {saving ? "Saving..." : saved ? <><Check className="h-4 w-4"/> Saved!</> : <><Save className="h-4 w-4"/> Save Changes</>}
        </button>
      </div>
    </div>
  )
}
