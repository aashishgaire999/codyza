import type { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { PublicPageCta } from "@/components/shared/public-page-cta"
import { FadeInView } from "@/components/effects/fade-in-view"

export const metadata: Metadata = {
  title: "Community",
  description: "Meet the Codyza builders learning, collaborating, and shipping in public.",
}

export const revalidate = 60

type PublicContributor = {
  codyza_id: string
  name: string
  github: string | null
  xp: number | null
  rank: string | null
  streak: number | null
  role: string | null
}

async function getCommunity() {
  const supabase = createClient()
  const { data } = await supabase
    .from("contributors")
    .select("codyza_id, name, github, xp, rank, streak, role")
    .order("xp", { ascending: false })
    .limit(48)

  const contributors = (data || []) as PublicContributor[]
  return {
    contributors,
    totalXp: contributors.reduce((total, person) => total + (person.xp || 0), 0),
    activeStreaks: contributors.filter((person) => (person.streak || 0) > 0).length,
  }
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

export default async function CommunityPage() {
  const { contributors, totalXp, activeStreaks } = await getCommunity()

  return (
    <PublicShell>
      <EditorialHero
        num="community / the people"
        title={<>different skills. <span className="cz-headline-muted">one shared ambition.</span></>}
        description="Codyza is made of named people doing visible work—not an anonymous member count."
      />

      <section className="cz-border-t px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px] cz-community-stats">
          <div className="cz-community-stat"><span className="cz-micro">builders listed</span><strong>{contributors.length}</strong></div>
          <div className="cz-community-stat"><span className="cz-micro">shared proof</span><strong>{totalXp.toLocaleString()} xp</strong></div>
          <div className="cz-community-stat"><span className="cz-micro">active streaks</span><strong>{activeStreaks}</strong></div>
        </div>
      </section>

      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <FadeInView variant="subtle"><p className="cz-kicker">the directory</p></FadeInView>
            <FadeInView variant="headline"><h2 className="cz-display">find the people behind the work.</h2></FadeInView>
          </div>

          {contributors.length === 0 ? (
            <div className="cz-project-empty mt-14">
              <div><p className="cz-micro">the first names are coming</p><p className="cz-project-empty-title">The directory is waiting for its opening crew.</p></div>
              <div><p className="cz-body">When contributor profiles are public, they will appear here with their rank, streak, and work.</p><Link href="/join" className="cz-inline-link mt-6">put your name on the work</Link></div>
            </div>
          ) : (
            <ul className="cz-people-grid mt-14">
              {contributors.map((person, index) => (
                <li key={person.codyza_id}>
                  <FadeInView delay={Math.min(index * 40, 240)} className="h-full">
                    <Link href={`/contributor/${person.codyza_id.toLowerCase()}`} className="cz-person-card">
                      <span className="cz-person-card-avatar" aria-hidden>{initials(person.name)}</span>
                      <h3>{person.name}</h3>
                      <p className="cz-person-card-meta">{person.role || "Codyza builder"} · {person.rank || "builder"}</p>
                      <div className="cz-person-card-proof"><span>{(person.xp || 0).toLocaleString()} xp</span><span>{person.streak || 0} day streak</span></div>
                    </Link>
                  </FadeInView>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 flex justify-center"><Link href="/leaderboard" className="cz-pill">open the full leaderboard</Link></div>
        </div>
      </section>

      <PublicPageCta title={<>your name belongs <span>on something real.</span></>} copy="Bring your skills, your curiosity, and enough commitment to finish what you start." />
    </PublicShell>
  )
}
