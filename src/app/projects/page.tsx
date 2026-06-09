import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Globe, GitBranch, Zap, Search } from "lucide-react"
import { SmartNavbar } from "@/components/shared/smart-navbar"
import { ParticleField } from "@/components/effects/particle-field"
import { GlowOrb } from "@/components/effects/glow-orb"

export const metadata: Metadata = {
  title: "Projects | Codyza",
  description: "Real projects shipped by the Codyza community.",
}

export const revalidate = 60

async function getProjects() {
  const supabase = createClient()
  const { data } = await supabase
    .from("submissions")
    .select("project_name, github_url, live_url, description, tech_stack, ai_score, xp_earned, codyza_id, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
  return data || []
}

async function getStats() {
  const supabase = createClient()
  const { count: total } = await supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved")
  const { count: members } = await supabase.from("contributors").select("*", { count: "exact", head: true })
  return { total: total || 0, members: members || 0 }
}

export default async function ProjectsPage() {
  const [projects, stats] = await Promise.all([getProjects(), getStats()])

  const allTech = Array.from(new Set(projects.flatMap(p => p.tech_stack || []))).sort()

  return (
    <div className="min-h-screen text-white" style={{background:"linear-gradient(135deg,#0f0c1a 0%,#130d24 50%,#0c1220 100%)"}}>

      <SmartNavbar />
      <ParticleField />
      <GlowOrb color="purple" size={800} className="-top-40 -left-40" duration={18} />
      <GlowOrb color="blue" size={600} className="top-1/2 -right-40" duration={22} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/8 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-green-400">Live Projects</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">
            Built by the{" "}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              crew.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Real projects shipped by real people. No tutorials. No clones.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-2xl font-black text-purple-400">{stats.total}</p>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Projects</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-2xl font-black text-blue-400">{stats.members}</p>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Members</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/8">
            <p className="text-2xl font-black text-cyan-400">{allTech.length}</p>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-500 mt-1">Tech Used</p>
          </div>
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">No approved projects yet.</p>
            <Link href="/apply" className="mt-4 inline-block text-purple-400 hover:text-purple-300 transition-colors text-sm">
              Join and be the first →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => {
              const scoreColor = project.ai_score >= 8 ? "#22c55e" : project.ai_score >= 6 ? "#a78bfa" : "#f59e0b"
              return (
                <div key={i} className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden">

                  {/* Top bar */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-0">
                    <span className="font-mono text-xs text-gray-500">{project.codyza_id}</span>
                    <div className="flex items-center gap-2">
                      {project.ai_score && (
                        <span style={{ color: scoreColor }} className="font-mono text-sm font-bold">
                          {project.ai_score}/10
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                        <Zap size={11} />
                        +{project.xp_earned}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <h3 className="font-bold text-base mb-2 group-hover:text-purple-300 transition-colors leading-snug">
                      {project.project_name}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {/* Tech tags */}
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, 5).map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded-md text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300">
                            {t}
                          </span>
                        ))}
                        {project.tech_stack.length > 5 && (
                          <span className="px-2 py-0.5 rounded-md text-xs border border-white/[0.08] text-gray-500" style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(12px)"}}>
                            +{project.tech_stack.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer links */}
                  <div className="flex items-center gap-3 px-5 py-4 border-t border-white/5">
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                      <GitBranch size={12} /> GitHub
                    </a>
                    {project.live_url && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                        <Globe size={12} /> Live Demo
                      </a>
                    )}
                    <Link href={`/contributor/${project.codyza_id.toLowerCase()}`}
                      className="ml-auto text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      View profile →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center p-10 rounded-2xl border border-white/8 bg-white/[0.02]"
          style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.06) 0%, transparent 70%)" }}>
          <h2 className="text-2xl font-black mb-2">Want your project here?</h2>
          <p className="text-gray-400 mb-6 text-sm">Apply to join Codyza, ship something real, and get reviewed by AI.</p>
          <Link href="/apply" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-sm hover:opacity-90 transition-opacity">
            Apply to Join →
          </Link>
        </div>
      </div>
    </div>
  )
}
