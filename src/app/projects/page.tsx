import type { Metadata } from "next"
import Link from "next/link"
import { GitBranch, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { PublicShell } from "@/components/shared/public-shell"
import { FadeInView } from "@/components/effects/fade-in-view"

export const metadata: Metadata = {
  title: "Projects",
  description: "The public record of work shipped by Codyza builders.",
}

export const revalidate = 60

type ProjectRecord = {
  project_name: string
  github_url: string | null
  live_url: string | null
  description: string | null
  tech_stack: string[] | null
  xp_earned: number | null
  codyza_id: string | null
  created_at: string | null
}

async function getProjects(): Promise<ProjectRecord[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("submissions")
    .select("project_name, github_url, live_url, description, tech_stack, xp_earned, codyza_id, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  return data || []
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ tech?: string }> }) {
  const projects = await getProjects()
  const { tech } = await searchParams
  const selectedTech = tech?.trim() || ""
  const allTech = Array.from(new Set(projects.flatMap((project) => project.tech_stack || []))).sort()
  const visibleProjects = selectedTech
    ? projects.filter((project) => project.tech_stack?.some((item) => item.toLowerCase() === selectedTech.toLowerCase()))
    : projects

  return (
    <PublicShell>
      <section className="cz-page-hero px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          <FadeInView variant="subtle"><p className="cz-micro">public record / projects</p></FadeInView>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.45fr] lg:items-end">
            <FadeInView variant="headline" delay={60}>
              <h1 className="cz-display max-w-4xl">work is the résumé.</h1>
            </FadeInView>
            <FadeInView variant="subtle" delay={150}>
              <p className="cz-body max-w-md">Every approved launch records what was built, who owned it, and where the work lives.</p>
            </FadeInView>
          </div>
        </div>
      </section>

      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          {allTech.length > 0 && (
            <nav className="cz-filter-row" aria-label="Filter projects by technology">
              <Link href="/projects" aria-current={!selectedTech ? "page" : undefined} className="cz-filter-link">all work</Link>
              {allTech.map((item) => (
                <Link
                  key={item}
                  href={`/projects?tech=${encodeURIComponent(item)}`}
                  aria-current={selectedTech.toLowerCase() === item.toLowerCase() ? "page" : undefined}
                  className="cz-filter-link"
                >
                  {item.toLowerCase()}
                </Link>
              ))}
            </nav>
          )}

          <div className="cz-ledger mt-10">
            <div className="cz-ledger-head" aria-hidden>
              <span>project</span><span>builder</span><span>proof</span><span>state</span>
            </div>
            {projects.length === 0 ? (
              <div className="cz-ledger-empty">
                <div><p className="cz-micro">an honest beginning</p><h2>No approved launches are public yet.</h2></div>
                <div><p className="cz-body max-w-md">We would rather show an empty record than fill this page with fictional work.</p><Link href="/join" className="cz-inline-link mt-6">build the first one with us</Link></div>
              </div>
            ) : visibleProjects.length === 0 ? (
              <div className="cz-ledger-empty">
                <div><p className="cz-micro">nothing filed here yet</p><h2>No projects use {selectedTech}.</h2></div>
                <Link href="/projects" className="cz-inline-link">clear the filter</Link>
              </div>
            ) : (
              visibleProjects.map((project, index) => (
                <FadeInView key={`${project.project_name}-${project.codyza_id}-${index}`} delay={Math.min(index * 50, 250)}>
                  <article className="cz-ledger-row">
                    <div>
                      <p className="cz-ledger-index">{String(index + 1).padStart(2, "0")}</p>
                      <h2>{project.project_name}</h2>
                      <p className="cz-ledger-description">{project.description || "An approved Codyza build."}</p>
                      <div className="cz-ledger-tech">{(project.tech_stack || []).slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>
                    </div>
                    <div>
                      {project.codyza_id ? <Link href={`/contributor/${project.codyza_id.toLowerCase()}`} className="cz-ledger-builder">{project.codyza_id.toLowerCase()}</Link> : <span className="cz-footer-muted">crew record</span>}
                    </div>
                    <div className="cz-ledger-links">
                      {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer"><GitBranch aria-hidden /> code</a>}
                      {project.live_url && <a href={project.live_url} target="_blank" rel="noopener noreferrer"><Globe aria-hidden /> live</a>}
                    </div>
                    <span className="cz-project-state">approved</span>
                  </article>
                </FadeInView>
              ))
            )}
          </div>

          <div className="mt-16 flex justify-center"><Link href="/join" className="cz-pill cz-pill-solid">bring your project to the crew</Link></div>
        </div>
      </section>
    </PublicShell>
  )
}
