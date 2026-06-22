import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { Globe, GitBranch, Zap } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-28 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">005 · projects</p>
          <h1 className="headline-section font-[family-name:var(--font-heading)] lowercase">
            built by the <span className="text-accent">crew</span>
          </h1>
          <p className="mt-4 text-muted-foreground">Real projects shipped by real people. No tutorials. No clones.</p>
        </div>

        <div className="mb-12 grid grid-cols-3 gap-4 max-w-lg">
          {[
            { v: stats.total, l: "projects" },
            { v: stats.members, l: "members" },
            { v: allTech.length, l: "technologies" },
          ].map((s) => (
            <div key={s.l} className="dashboard-stat text-center">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold">{s.v}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        {projects.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-muted-foreground">No live projects yet.</p>
            <Link href="/apply" className="btn-accent mt-6 inline-block rounded-full px-6 py-3 text-sm">Be the first to ship →</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <article key={p.project_name + p.codyza_id} className="surface-card flex flex-col p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">{p.codyza_id}</span>
                  {p.ai_score != null && (
                    <span className="flex items-center gap-1 text-xs text-accent"><Zap className="h-3 w-3" />{p.ai_score}</span>
                  )}
                </div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold lowercase">{p.project_name}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(p.tech_stack || []).slice(0, 4).map((t: string) => (
                    <span key={t} className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 border-t border-border pt-4">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                      <GitBranch className="h-3.5 w-3.5" /> Code
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-accent hover:opacity-80">
                      <Globe className="h-3.5 w-3.5" /> Live
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
