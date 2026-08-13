import Link from "next/link"
import { ScrollProgress } from "@/components/landing/scroll-progress"
import { Nav } from "@/components/landing/nav"
import { Footer } from "@/components/landing/footer"
import { SmoothScroll } from "@/components/providers/smooth-scroll"
import { FadeInView } from "@/components/effects/fade-in-view"
import { MANIFESTO_COPY, CREW_PILLARS, APPLY_ROADMAP } from "@/constants/landing"
import { FOUNDING_TEAM, LEADERSHIP_TEAM } from "@/constants/team"
import { getSiteContentState } from "@/lib/site-content"
import { publicMetadata } from "@/lib/public-metadata"

export const metadata = publicMetadata("About", "Why Codyza exists, how it works, and the people who lead it.", "/about")

const LEADERSHIP = [...FOUNDING_TEAM, ...LEADERSHIP_TEAM]

export default async function AboutPage() {
  const intro = await getSiteContentState<{ label: string; title: string; headline: string; description: string; copy: string }>("about", "intro")
  if (!intro.published) return null
  const introTitle = intro.content.title || intro.content.headline
  const introDescription = intro.content.description || intro.content.copy
  return (
    <SmoothScroll>
      <main className="cz-landing min-h-screen overflow-x-clip">
        <ScrollProgress />
        <Nav />

        <section className="cz-border-t px-5 pb-14 pt-20 sm:px-8 md:pt-24 lg:px-10">
          <div className="mx-auto max-w-[1320px]">
            <FadeInView variant="subtle">
              <p className="cz-micro mb-10">{intro.content.label || "about / why codyza exists"}</p>
            </FadeInView>
            <FadeInView variant="headline" delay={80}>
              <h1 className="cz-display max-w-4xl">
                {introTitle || <>you don&apos;t need another course.<br /><span className="cz-headline-muted">you need a crew.</span></>}
              </h1>
            </FadeInView>
            <FadeInView variant="subtle" delay={200}>
              <p className="cz-body mt-9 max-w-xl">{introDescription || MANIFESTO_COPY}</p>
            </FadeInView>

            <div className="mt-16 grid gap-6 sm:grid-cols-3">
              {CREW_PILLARS.map((pillar, i) => (
                <FadeInView key={pillar.title} delay={i * 80}>
                  <div className="cz-border-t pt-5">
                    <p className="cz-pillar-title">{pillar.title}</p>
                    <p className="cz-body mt-2 text-[13px]">{pillar.desc}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1320px]">
            <FadeInView variant="subtle">
              <p className="cz-micro mb-10">how it works</p>
            </FadeInView>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {APPLY_ROADMAP.map((step, i) => (
                <FadeInView key={step.num} delay={i * 70}>
                  <div className="cz-border-t pt-5">
                    <p className="cz-micro">{step.num}</p>
                    <p className="mt-3 cz-pillar-title">{step.title}</p>
                    <p className="cz-body mt-1 text-[13px]">{step.desc}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section id="leadership" className="cz-section scroll-mt-24 cz-border-t px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1320px]">
            <FadeInView variant="headline">
              <h2 className="cz-display max-w-3xl">
                the people <span className="cz-headline-muted">behind codyza.</span>
              </h2>
            </FadeInView>

            <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {LEADERSHIP.map((member, i) => (
                <FadeInView key={member.name} delay={i * 60}>
                  <article className="cz-card h-full p-6">
                    <div
                      aria-hidden
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl font-mono text-sm font-bold text-white"
                      style={{ background: member.color }}
                    >
                      {member.initials}
                    </div>
                    <h3 className="font-[family-name:var(--font-instrument)] text-xl lowercase">{member.name}</h3>
                    <p className="cz-micro mt-1.5">{member.role.toLowerCase()}</p>
                    <p className="cz-body mt-3 text-[13px]">{member.bio}</p>
                  </article>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="cz-section cz-border-t px-5 pb-10 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[1320px] text-center">
            <FadeInView variant="subtle">
              <p className="cz-body mb-8 text-[15px]">ready to build with us?</p>
              <Link href="/join" className="cz-pill cz-pill-solid !min-h-11 !px-7 !text-[12px]">
                apply to join
              </Link>
            </FadeInView>
          </div>
        </section>

        <Footer />
      </main>
    </SmoothScroll>
  )
}
