import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { SpecimenCard } from "@/components/shared/specimen-card"

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects shipped by Codyza members — live repos, not tutorials.",
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
  const { count: total } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
  const { count: members } = await supabase.from("contributors").select("*", { count: "exact", head: true })
  return { total: total || 0, members: members || 0 }
}

export default async function ProjectsPage() {
  const [projects, stats] = await Promise.all([getProjects(), getStats()])
  const allTech = Array.from(new Set(projects.flatMap((p) => p.tech_stack || []))).sort()

  return (
    <PublicShell>
      <EditorialHero
        num="projects"
        title={
          <>
            shipped by the <span className="text-black/35">crew</span>
          </>
        }
        description="Live repos from members. GitHub links, deploy URLs, the whole thing."
      />
      <div className="mx-auto max-w-[1600px] px-4 pb-24 sm:px-6 md:px-8">
        {projects.length > 0 && (
          <div className="mb-12 grid max-w-lg grid-cols-3 gap-4">
            {[
              { v: stats.total, l: "projects" },
              { v: stats.members, l: "members" },
              { v: allTech.length, l: "technologies" },
            ].map((s) => (
              <div key={s.l} className="journal-ledger-stat">
                <p className="value">{s.v}</p>
                <p className="sofi-micro mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="py-24 text-center">
            <p className="sofi-body">Nothing live yet — you could fix that.</p>
            <Link href="/apply" className="sofi-pill sofi-pill-fill mt-8 inline-flex">
              be the first to ship →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <SpecimenCard key={p.project_name + p.codyza_id} project={p} />
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  )
}
