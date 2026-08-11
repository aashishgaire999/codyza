import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { createServerSupabase } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { GitBranch, Zap, Flame, Trophy, Calendar } from "lucide-react"
import { PublicShell } from "@/components/shared/public-shell"
import { RankBadge } from "@/components/shared/rank-badge"
import { SpecimenCard } from "@/components/shared/specimen-card"
import { XpProgressBar } from "@/components/shared/xp-progress-bar"
import { RANKS as RANK_XP } from "@/lib/ranks"

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params
  const id = rawId.toUpperCase()
  const supabase = createServerSupabase()
  const { data } = await supabase.from("contributors").select("name, rank, role").eq("codyza_id", id).single()
  if (!data) return { title: "Contributor Not Found" }
  return {
    title: `${data.name} (${id})`,
    description: `${data.name} — ${data.role || "Contributor"} at Codyza. Rank: ${data.rank}`,
  }
}

export default async function ContributorProfile({ params }: Props) {
  const { id: rawId } = await params
  const id = rawId.toUpperCase()
  const supabase = createServerSupabase()

  const { data: contributor, error } = await supabase
    .from("contributors")
    .select("codyza_id, name, github, xp, rank, streak, role, avatar_url, skills, joined_at")
    .eq("codyza_id", id)
    .single()
  if (error || !contributor) notFound()

  const { data: submissions } = await supabase
    .from("submissions")
    .select("project_name, github_url, live_url, description, tech_stack, xp_earned, status, created_at")
    .eq("codyza_id", id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const currentRankIdx = RANK_XP.findIndex(r => r.name === contributor.rank)
  const nextRank = RANK_XP[currentRankIdx + 1]
  const initials = contributor.name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
  const joinedDate = contributor.joined_at
    ? new Date(contributor.joined_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "2026"
  const profileUrl = `codyza.com/contributor/${contributor.codyza_id.toLowerCase()}`

  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:px-8 md:py-16">
        <Link
          href="/community"
          className="sofi-body mb-8 inline-flex items-center gap-2 text-black/50 transition-colors hover:text-black"
        >
          back to community
        </Link>

        <div className="journal-form-card mb-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#f7f7f7] text-2xl font-bold">
                {contributor.avatar_url ? (
                  <Image
                    src={contributor.avatar_url}
                    alt={contributor.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-instrument)] text-3xl lowercase tracking-tight text-black">
                  {contributor.name}
                </h1>
                <div className="mt-1 font-mono text-lg font-bold tracking-wider text-black">
                  CZX-<span className="text-[var(--journal-terracotta)]">{contributor.codyza_id.replace("CZX-", "")}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <RankBadge rank={contributor.rank} />
                  {contributor.role && (
                    <span className="sofi-body text-sm lowercase">
                      {contributor.role.toLowerCase().replace(/\s*&\s*/g, " & ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-black/50">
                <Calendar className="h-3 w-3" />
                <span className="sofi-micro">joined {joinedDate}</span>
              </div>
              {contributor.github && (
                <a
                  href={`https://github.com/${contributor.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sofi-body flex items-center gap-1.5 text-sm text-black/50 hover:text-black"
                >
                  <GitBranch className="h-3 w-3" /> @{contributor.github}
                </a>
              )}
              {contributor.streak > 0 && (
                <div className="flex items-center gap-1.5 text-[var(--journal-sage)]">
                  <Flame className="h-3 w-3" />
                  <span className="text-xs font-semibold">{contributor.streak} week streak</span>
                </div>
              )}
            </div>
          </div>

          {contributor.skills?.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {(contributor.skills as string[]).map((s: string) => (
                <span
                  key={s}
                  className="rounded-full border border-black/10 bg-[#f7f7f7] px-2.5 py-0.5 font-mono text-[10px] text-black/50"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <XpProgressBar current={contributor.xp} max={nextRank?.minXP || contributor.xp} />
          {nextRank && (
            <p className="sofi-micro mt-2">
              {(nextRank.minXP - contributor.xp).toLocaleString()} xp until {nextRank.name}
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: <Zap className="h-4 w-4" />, value: contributor.xp.toLocaleString(), label: "total xp" },
            { icon: <Trophy className="h-4 w-4" />, value: contributor.rank.replace(" Engineer", "").replace("Associate ", "Assoc. "), label: "rank" },
            { icon: <Flame className="h-4 w-4" />, value: contributor.streak, label: "streak" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="journal-ledger-stat">
              <div className="mb-2 flex justify-center text-[var(--journal-sage)]">{icon}</div>
              <p className="value text-xl">{value}</p>
              <p className="sofi-micro mt-2">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="sofi-micro mb-4">approved projects ({submissions?.length || 0})</h2>
          {(!submissions || submissions.length === 0) ? (
            <div className="journal-form-card border-dashed p-10 text-center">
              <p className="sofi-body">Nothing approved yet — check back after their next ship.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {submissions.map((sub, i) => (
                <SpecimenCard
                  key={`${sub.project_name}-${i}`}
                  project={{
                    project_name: sub.project_name,
                    github_url: sub.github_url,
                    live_url: sub.live_url,
                    description: sub.description,
                    tech_stack: sub.tech_stack,
                    codyza_id: contributor.codyza_id,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="journal-form-card flex items-center justify-between">
          <span className="sofi-body text-sm">public link</span>
          <span className="sofi-micro text-[var(--journal-terracotta)]">{profileUrl}</span>
        </div>
      </main>
    </PublicShell>
  )
}
