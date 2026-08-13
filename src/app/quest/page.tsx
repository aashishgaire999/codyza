import Link from "next/link"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { PublicPageCta } from "@/components/shared/public-page-cta"
import { FadeInView } from "@/components/effects/fade-in-view"
import { getSiteContentState } from "@/lib/site-content"
import { publicMetadata } from "@/lib/public-metadata"

export const metadata = publicMetadata("Quest", "Inside Codyza Quest—the operating system where the crew tracks progress and ships together.", "/quest")

const STAGES = [
  ["Apply", "Tell us what you want to build and why Codyza is the right room."],
  ["Review", "A founder reads every answer and looks for intent, curiosity, and follow-through."],
  ["Accepted", "Accepted builders receive a private invitation and a clear first step."],
  ["Onboarding", "Create your profile, receive a Codyza ID, and meet the operating rhythm."],
  ["Dashboard", "See rank, XP, streaks, active work, and the next meaningful move."],
  ["Tasks", "Choose scoped work with visible ownership and a real finish line."],
  ["Projects", "Submit proof, receive review, and publish approved work to Codyza.com."],
  ["Certificates", "Verified milestones can become public credentials for employers and schools."],
] as const

export default async function QuestPage() {
  const intro = await getSiteContentState<{ title: string; headline: string; description: string; copy: string }>("quest", "intro")
  if (!intro.published) return null
  return (
    <PublicShell>
      <EditorialHero
        num="quest / inside the operating system"
        title={intro.content.title || intro.content.headline || <>the public site tells the story. <span className="cz-headline-muted">quest runs the work.</span></>}
        description={intro.content.description || intro.content.copy || "A private workspace for accepted Codyza builders—built around ownership, progress, and proof."}
      />

      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <FadeInView variant="headline">
            <div><p className="cz-kicker">the dark room behind the paper</p><h2 className="cz-display mt-6">one place to know what matters next.</h2><p className="cz-body mt-7 max-w-md">Quest gives the crew a shared memory: work claimed, progress earned, reviews completed, and projects shipped.</p></div>
          </FadeInView>
          <FadeInView variant="subtle" delay={120}>
            <div className="cz-arcade-window" role="img" aria-label="Illustration of the Codyza Quest member dashboard">
              <div className="cz-arcade-bar"><span className="cz-arcade-dot" /> quest / member dashboard</div>
              <div className="cz-arcade-body"><div className="cz-arcade-sidebar"><span>overview</span><span>projects</span><span>bounties</span><span>groups</span><span>settings</span></div><div className="cz-arcade-main"><p className="cz-micro cz-arcade-kicker">your next rank</p><h3>software engineer</h3><div className="cz-arcade-progress"><span /></div><div className="cz-arcade-rows"><p><strong>Project review</strong><span>ready</span></p><p><strong>Weekly contribution</strong><span>in progress</span></p><p><strong>Public profile</strong><span>live</span></p></div></div></div>
            </div>
          </FadeInView>
        </div>
      </section>

      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          <FadeInView variant="headline"><p className="cz-kicker">the path</p><h2 className="cz-display mt-6 max-w-4xl">from first answer to public proof.</h2></FadeInView>
          <div className="cz-quest-stage-list mt-14">
            {STAGES.map(([title, copy], index) => <FadeInView key={title} delay={Math.min(index * 45, 220)}><article className="cz-quest-stage"><span className="cz-micro">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article></FadeInView>)}
          </div>
          <Link href="/certificates/verify" className="cz-inline-link mt-10">verify a Codyza certificate</Link>
        </div>
      </section>

      <PublicPageCta title={<>ready to enter <span>the working room?</span></>} copy="Apply to join the crew, or log in if you already have a Codyza account." />
    </PublicShell>
  )
}
