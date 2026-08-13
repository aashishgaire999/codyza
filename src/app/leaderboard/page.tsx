import Link from "next/link"
import { JOIN_HREF } from "@/constants/site"
import { createClient } from "@/lib/supabase"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { PublicPageCta } from "@/components/shared/public-page-cta"
import { FadeInView } from "@/components/effects/fade-in-view"
import { publicMetadata } from "@/lib/public-metadata"

export const metadata = publicMetadata("Leaderboard", "The Codyza proof-of-work ranking, ordered by XP earned from approved contributions.", "/leaderboard")

export const revalidate = 60

type Contributor = {
  codyza_id: string
  name: string
  xp: number
  rank: string
  streak: number
  role: string | null
}

async function getLeaderboard(): Promise<Contributor[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from("contributors")
    .select("codyza_id, name, xp, rank, streak, role")
    .order("xp", { ascending: false })
    .limit(100)
  return data || []
}

export default async function LeaderboardPage() {
  const contributors = await getLeaderboard()
  const totalXp = contributors.reduce((sum, contributor) => sum + (contributor.xp || 0), 0)

  return (
    <PublicShell>
      <EditorialHero
        num="community / leaderboard"
        title={<>proof, ordered by <span className="cz-headline-muted">work shipped.</span></>}
        description="XP comes from approved contribution—not time online, popularity, or a purchased badge."
      />

      <section className="cz-border-t px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          <Link href="/community" className="cz-inline-link mb-10">community</Link>
          <div className="cz-community-stats">
            <div className="cz-community-stat"><span className="cz-micro">on the board</span><strong>{contributors.length}</strong></div>
            <div className="cz-community-stat"><span className="cz-micro">recorded proof</span><strong>{totalXp.toLocaleString()} xp</strong></div>
            <div className="cz-community-stat"><span className="cz-micro">current lead</span><strong>{contributors[0]?.name || "open"}</strong></div>
          </div>
        </div>
      </section>

      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          {contributors.length === 0 ? (
            <div className="cz-project-empty"><div><p className="cz-micro">open board</p><p className="cz-project-empty-title">No public XP has been recorded yet.</p></div><div><p className="cz-body">The first approved contribution sets the pace.</p><Link href={JOIN_HREF} className="cz-inline-link mt-6">earn the first line</Link></div></div>
          ) : (
            <ol className="cz-ranking-list">
              {contributors.map((contributor, index) => (
                <li key={contributor.codyza_id}>
                  <FadeInView delay={Math.min(index * 35, 220)}>
                    <Link href={`/contributor/${contributor.codyza_id.toLowerCase()}`} className="cz-ranking-row">
                      <span className="cz-ranking-position">{String(index + 1).padStart(2, "0")}</span>
                      <div><h2>{contributor.name}</h2><p>{contributor.codyza_id.toLowerCase()} · {contributor.role || "Codyza builder"}</p></div>
                      <div><strong>{contributor.rank}</strong><span>rank</span></div>
                      <div><strong>{(contributor.xp || 0).toLocaleString()}</strong><span>xp</span></div>
                      <div><strong>{contributor.streak || 0}</strong><span>streak</span></div>
                    </Link>
                  </FadeInView>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <PublicPageCta title={<>the board moves when <span>the work moves.</span></>} copy="Join the crew, contribute something useful, and let the public record speak." />
    </PublicShell>
  )
}
