import { Metadata } from "next"
import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { ArrowLeft, GitBranch, Globe, Zap, Flame, Trophy, Calendar } from "lucide-react"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { XpProgressBar } from "@/components/shared/xp-progress-bar"

interface Props { params: Promise<{ id: string }> }

const RANK_XP = [
  { name: "Apprentice", minXP: 0 },
  { name: "Associate Engineer", minXP: 500 },
  { name: "Software Engineer", minXP: 1500 },
  { name: "Senior Engineer", minXP: 3500 },
  { name: "Staff Engineer", minXP: 7000 },
  { name: "Principal Engineer", minXP: 12000 },
  { name: "Distinguished Engineer", minXP: 20000 },
  { name: "Codyza Fellow", minXP: 35000 },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: rawId } = await params
  const id = rawId.toUpperCase()
  const supabase = createServerSupabase()
  const { data } = await supabase.from("contributors").select("name, rank, role").eq("codyza_id", id).single()
  if (!data) return { title: "Contributor Not Found | Codyza" }
  return {
    title: `${data.name} (${id}) | Codyza`,
    description: `${data.name} — ${data.role || "Contributor"} at Codyza. Rank: ${data.rank}`,
  }
}

export default async function ContributorProfile({ params }: Props) {
  const { id: rawId } = await params
  const id = rawId.toUpperCase()
  const supabase = createServerSupabase()

  const { data: contributor, error } = await supabase.from("contributors").select("*").eq("codyza_id", id).single()
  if (error || !contributor) notFound()

  const { data: submissions } = await supabase
    .from("submissions")
    .select("project_name, github_url, live_url, description, tech_stack, ai_score, xp_earned, status, created_at")
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-28 md:px-8">
        <Link
          href="/leaderboard"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to leaderboard
        </Link>

        <div className="id-card-glow mb-6">
          <div className="id-card-inner">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-2xl font-bold">
                  {contributor.avatar_url ? (
                    <img src={contributor.avatar_url} alt={contributor.name} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold lowercase tracking-tight">
                    {contributor.name}
                  </h1>
                  <div className="mt-1 font-mono text-lg font-bold tracking-wider">
                    <span className="text-muted-foreground">CZX-</span>
                    <span className="text-accent">{contributor.codyza_id.replace("CZX-", "")}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                      {contributor.rank}
                    </span>
                    {contributor.role && (
                      <span className="text-sm text-muted-foreground">{contributor.role}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Joined {joinedDate}</span>
                </div>
                {contributor.github && (
                  <a
                    href={`https://github.com/${contributor.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <GitBranch className="h-3 w-3" /> @{contributor.github}
                  </a>
                )}
                {contributor.streak > 0 && (
                  <div className="flex items-center gap-1.5 text-accent">
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
                    className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <XpProgressBar
              current={contributor.xp}
              max={nextRank?.minXP || contributor.xp}
            />
            {nextRank && (
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                {(nextRank.minXP - contributor.xp).toLocaleString()} XP until {nextRank.name}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { icon: <Zap className="h-4 w-4" />, value: contributor.xp.toLocaleString(), label: "Total XP" },
            { icon: <Trophy className="h-4 w-4" />, value: contributor.rank.replace(" Engineer", "").replace("Associate ", "Assoc. "), label: "Rank" },
            { icon: <Flame className="h-4 w-4" />, value: contributor.streak, label: "Streak" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="dashboard-stat text-center">
              <div className="mb-2 flex justify-center text-accent">{icon}</div>
              <p className="font-[family-name:var(--font-heading)] text-xl font-bold">{value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Approved Projects ({submissions?.length || 0})
          </h2>
          {(!submissions || submissions.length === 0) ? (
            <div className="surface-card border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">No approved projects yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {submissions.map((sub: any, i: number) => (
                <div key={i} className="surface-card p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold lowercase">
                        {sub.project_name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{sub.description}</p>
                    </div>
                    {sub.ai_score && (
                      <div className="flex-shrink-0 text-center">
                        <div className="font-[family-name:var(--font-heading)] text-xl font-bold text-accent">
                          {sub.ai_score}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">/10</div>
                      </div>
                    )}
                  </div>
                  {sub.tech_stack?.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {sub.tech_stack.slice(0, 6).map((t: string) => (
                        <span
                          key={t}
                          className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    {sub.github_url && (
                      <a
                        href={sub.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <GitBranch className="h-3 w-3" /> GitHub
                      </a>
                    )}
                    {sub.live_url && (
                      <a
                        href={sub.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-accent transition-colors hover:opacity-80"
                      >
                        <Globe className="h-3 w-3" /> Live Demo
                      </a>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">+{sub.xp_earned} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">Share this profile</span>
          <span className="font-mono text-[10px] text-accent">{profileUrl}</span>
        </div>
      </main>

      <Footer />
    </div>
  )
}
