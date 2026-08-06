import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { LeaderboardPodium } from "@/components/shared/leaderboard-podium"
import { RankBadge } from "@/components/shared/rank-badge"
import { TrendingUp, Zap, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Who's shipping the most on Codyza.",
}

interface Contributor {
  codyza_id: string
  name: string
  github: string
  xp: number
  rank: string
  streak: number
  role: string
  avatar_url?: string
}

async function getLeaderboard(): Promise<Contributor[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contributors")
    .select("codyza_id, name, github, xp, rank, streak, role, avatar_url")
    .order("xp", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Leaderboard fetch error:", error)
    return []
  }

  return data || []
}

export default async function LeaderboardPage() {
  const contributors = await getLeaderboard()

  return (
    <PublicShell>
      <EditorialHero
        num="leaderboard"
        title={
          <>
            who&apos;s <span className="text-black/35">shipping</span>
          </>
        }
        description="Sorted by XP — points for merged work, live deploys, and showing up."
      />

      <div className="mx-auto max-w-[1600px] px-4 pb-24 sm:px-6 md:px-8">
        <LeaderboardPodium contributors={contributors} />

        {contributors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="sofi-body">Empty so far. First one on the board gets bragging rights.</p>
            <Link href="/apply" className="sofi-pill sofi-pill-fill mt-6 inline-flex">
              apply to join →
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { icon: Zap, label: "on the board", value: contributors.length },
                {
                  icon: TrendingUp,
                  label: "xp total",
                  value: contributors.reduce((sum, c) => sum + c.xp, 0).toLocaleString(),
                },
                { icon: Crown, label: "top rank", value: contributors[0]?.rank || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="journal-ledger-stat text-left md:text-center">
                  <div className="mb-2 flex items-center gap-2 md:justify-center">
                    <Icon className="h-4 w-4 text-[var(--journal-sage)]" />
                    <span className="sofi-micro">{label}</span>
                  </div>
                  <p className={typeof value === "number" ? "value text-2xl md:text-3xl" : "font-[family-name:var(--font-instrument)] text-lg lowercase text-black"}>{value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {contributors.map((contributor, index) => {
            const position = index + 1
            const isTopThree = position <= 3

            return (
              <Link
                key={contributor.codyza_id}
                href={`/contributor/${contributor.codyza_id.toLowerCase()}`}
                className={`journal-specimen group block ${isTopThree ? "border-[var(--journal-terracotta)]/30" : ""}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex items-center gap-4 lg:flex-1">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-instrument)] text-xl ${
                        isTopThree ? "bg-[var(--journal-terracotta)]/10 text-[var(--journal-terracotta)]" : "bg-[#f7f7f7] text-black/40"
                      }`}
                    >
                      {position}
                    </div>
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-black/10">
                      {contributor.avatar_url ? (
                        <img
                          src={contributor.avatar_url.split("?")[0]}
                          alt={contributor.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#f7f7f7] font-bold text-black/60">
                          {contributor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-[family-name:var(--font-instrument)] text-lg lowercase text-black group-hover:opacity-70">
                        {contributor.name}
                      </h3>
                      <p className="sofi-micro">{contributor.codyza_id}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                    <RankBadge rank={contributor.rank} />
                    <div className="text-right">
                      <p className="font-[family-name:var(--font-instrument)] text-xl text-black">
                        {contributor.xp.toLocaleString()}
                      </p>
                      <p className="sofi-micro">xp</p>
                    </div>
                    <div className="text-right">
                      <p className="font-[family-name:var(--font-instrument)] text-xl text-black">{contributor.streak}</p>
                      <p className="sofi-micro">streak</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
              })}
            </div>
          </>
        )}
      </div>
    </PublicShell>
  )
}
