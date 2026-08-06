"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Globe, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { FadeInView } from "@/components/effects/fade-in-view"

type Project = {
  project_name: string
  github_url?: string | null
  live_url?: string | null
  description?: string | null
  tech_stack?: string[] | null
  ai_score?: number | null
  codyza_id?: string | null
}

function ProjectCard({ p }: { p: Project }) {
  const href = p.live_url || p.github_url || (p.codyza_id ? `/contributor/${p.codyza_id.toLowerCase()}` : "/projects")
  const isExternal = Boolean(p.live_url || p.github_url)

  const inner = (
    <>
      <div className="relative z-[1] mb-4 flex items-center justify-between gap-2">
        <span className="cz-micro tracking-[0.18em]">{p.codyza_id || "specimen"}</span>
        {p.ai_score != null && (
          <span className="cz-project-score flex items-center gap-1 font-mono text-[10px]">
            <Zap className="h-3 w-3" />
            {p.ai_score}/10
          </span>
        )}
      </div>
      <h3 className="cz-project-title relative z-[1] font-[family-name:var(--font-instrument)] text-2xl lowercase tracking-tight">
        {p.project_name}
      </h3>
      <p className="cz-body relative z-[1] mt-3 line-clamp-3 flex-1 text-[14px]">{p.description}</p>
      <div className="relative z-[1] mt-5 flex flex-wrap gap-1.5">
        {(p.tech_stack || []).slice(0, 4).map((t) => (
          <span key={t} className="cz-chip">
            {t}
          </span>
        ))}
      </div>
      <div className="relative z-[1] mt-6 flex items-center justify-between cz-border-t pt-5">
        <span className="cz-project-link flex items-center gap-1.5 text-[13px]">
          <Globe className="h-3.5 w-3.5" />
          {p.live_url ? "visit live" : p.github_url ? "view code" : "view profile"}
        </span>
        <ArrowUpRight className="cz-project-arrow h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </>
  )

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="cz-project-card group"
        aria-label={`Open ${p.project_name}`}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link href={href} className="cz-project-card group" aria-label={`View ${p.project_name}`}>
      {inner}
    </Link>
  )
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("submissions")
        .select("project_name, github_url, live_url, description, tech_stack, ai_score, codyza_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6)
      setProjects(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <section id="projects" className="cz-section scroll-mt-24 cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:gap-16">
          <FadeInView variant="headline">
            <p className="cz-micro mb-8">006 / currently shipping</p>
            <h2 className="cz-display max-w-2xl">
              real things,
              <span className="block cz-headline-muted">built right now.</span>
            </h2>
          </FadeInView>
          <FadeInView variant="subtle" delay={150}>
            <p className="cz-body max-w-sm lg:pb-2 lg:text-right">
              Live deployments from people inside the community.
            </p>
          </FadeInView>
        </div>

        {loading ? (
          <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="cz-skeleton h-72 animate-pulse rounded-[20px]" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <FadeInView delay={180}>
            <div className="mt-16 md:mt-24">
              <p className="cz-display cz-empty-mark">—</p>
              <p className="cz-body mt-6 max-w-md text-[16px]">Nothing live yet — you could fix that.</p>
              <Link href="/apply" className="cz-pill cz-pill-solid mt-10 inline-flex">
                be the first to ship →
              </Link>
            </div>
          </FadeInView>
        ) : (
          <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <FadeInView key={`${p.project_name}-${p.codyza_id}`} delay={100 + i * 80}>
                <ProjectCard p={p} />
              </FadeInView>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <FadeInView delay={280}>
            <div className="mt-16 flex justify-center md:mt-20">
              <Link href="/projects" className="cz-pill">
                view all projects
              </Link>
            </div>
          </FadeInView>
        )}
      </div>
    </section>
  )
}
