import Link from "next/link"
import { GitBranch, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export type SpecimenProject = {
  project_name: string
  github_url?: string | null
  live_url?: string | null
  description?: string | null
  tech_stack?: string[] | null
  codyza_id?: string | null
}

type SpecimenCardProps = {
  project: SpecimenProject
  className?: string
}

export function SpecimenCard({ project, className }: SpecimenCardProps) {
  const p = project
  return (
    <article className={cn("journal-specimen flex flex-col", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="journal-label">{p.codyza_id || "specimen"}</span>
        <span className="cz-project-state">approved</span>
      </div>
      <h2 className="font-[family-name:var(--font-instrument)] text-2xl font-normal lowercase tracking-tight text-black">
        {p.project_name}
      </h2>
      <p className="sofi-body mt-3 flex-1 line-clamp-3 text-[14px]">{p.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(p.tech_stack || []).slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded border border-black/8 bg-[#f7f7f7] px-2 py-0.5 font-mono text-[10px] text-black/50"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 flex gap-4 border-t border-black/8 pt-4">
        {p.github_url && (
          <a
            href={p.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-black/50 transition-colors hover:text-black"
          >
            <GitBranch className="h-3.5 w-3.5" /> code
          </a>
        )}
        {p.live_url && (
          <a
            href={p.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[13px] text-[var(--journal-sage)] transition-opacity hover:opacity-80"
          >
            <Globe className="h-3.5 w-3.5" /> live
          </a>
        )}
        {p.codyza_id && (
          <Link
            href={`/contributor/${p.codyza_id.toLowerCase()}`}
            className="ml-auto text-[13px] text-black/40 transition-colors hover:text-black"
          >
            profile
          </Link>
        )}
      </div>
    </article>
  )
}
