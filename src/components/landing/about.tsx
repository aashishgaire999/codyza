"use client"

import { useEffect, useState } from "react"
import { createClient, getRankFromXP, getNextRank } from "@/lib/supabase"
import { APPLY_ROADMAP, CREW_PILLARS, MANIFESTO_COPY } from "@/constants/landing"
import { CzxIdCard } from "@/components/shared/czx-id-card"
import { FadeInView } from "@/components/effects/fade-in-view"

export function About() {
  const [liveCount, setLiveCount] = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [featured, setFeatured] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ count: live }, { count: members }, { data: top }] = await Promise.all([
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("contributors").select("*", { count: "exact", head: true }),
        supabase.from("contributors").select("*").order("xp", { ascending: false }).limit(1),
      ])
      setLiveCount(live || 0)
      setMemberCount(members || 0)
      setFeatured(top?.[0] || null)
    }
    load()
  }, [])

  return (
    <section id="about" className="cz-section scroll-mt-24 cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <FadeInView variant="subtle">
          <p className="cz-micro mb-10">005 / what is codyza</p>
        </FadeInView>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24">
          <div>
            <FadeInView variant="headline" delay={80}>
              <h2 className="cz-display max-w-4xl">
                you don&apos;t need another course.
                <br />
                <span className="cz-headline-muted">you need a crew.</span>
              </h2>
            </FadeInView>

            <FadeInView variant="subtle" delay={200}>
              <p className="cz-body mt-9 max-w-xl">{MANIFESTO_COPY}</p>
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

            <FadeInView delay={200}>
              <div className="mt-16 grid grid-cols-3 gap-6 cz-border-t pt-10">
                <div>
                  <p className="cz-stat-value">{liveCount}</p>
                  <p className="cz-micro mt-3">live projects</p>
                </div>
                <div>
                  <p className="cz-stat-value">{memberCount}</p>
                  <p className="cz-micro mt-3">members</p>
                </div>
                <div>
                  <p className="cz-stat-value">$0</p>
                  <p className="cz-micro mt-3">fees ever</p>
                </div>
              </div>
            </FadeInView>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
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

          <FadeInView className="flex flex-col items-center gap-8 lg:items-end lg:pt-6">
            <CzxIdCard
              variant="dark"
              id={featured?.codyza_id?.replace(/^CZX-/i, "") || "0042"}
              name={featured?.name || "your name here"}
              rank={featured?.rank || getRankFromXP(0).name}
              xp={featured?.xp || 0}
              xpMax={featured ? getNextRank(featured.xp || 0)?.minXP ?? featured.xp : getRankFromXP(0).minXP + 500}
              joined={
                featured?.joined_at
                  ? new Date(featured.joined_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                  : "—"
              }
            />
            <p className="cz-body max-w-xs text-center text-[13px] lg:text-right">
              Every contributor gets a CZX ID — your passport inside the crew.
            </p>
          </FadeInView>
        </div>
      </div>
    </section>
  )
}
