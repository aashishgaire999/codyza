"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient, getRankFromXP, getNextRank } from "@/lib/supabase"
import { CzxIdCard } from "@/components/shared/czx-id-card"
import { FadeInView } from "@/components/effects/fade-in-view"

const CREW_PATH = ["apply", "meet the crew", "build", "ship"] as const

type FeaturedContributor = {
  codyza_id: string
  name: string
  rank: string
  xp: number
  joined_at: string | null
}

export function About() {
  const [liveCount, setLiveCount] = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [featured, setFeatured] = useState<FeaturedContributor | null>(null)

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
    void load()
  }, [])

  return (
    <section id="about" className="cz-home-story scroll-mt-24 cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="relative z-[1] mx-auto max-w-[1320px]">
        <div className="cz-home-story-head">
          <FadeInView variant="headline">
            <div>
              <p className="cz-kicker">who we are</p>
              <h2>real people. useful work.</h2>
            </div>
          </FadeInView>
          <FadeInView variant="subtle" delay={100}>
            <p>We find useful work, form small crews, and help members ship it.</p>
          </FadeInView>
        </div>

        <div className="cz-home-story-grid">
          <FadeInView variant="subtle" className="cz-home-photo-wrap">
            <figure className="cz-home-photo">
              <Image
                src="/press/codyza-founders-illustrated.jpg"
                alt="Illustration of three Codyza founders holding their First Dollar Award"
                fill
                priority={false}
                sizes="(max-width: 900px) 100vw, 64vw"
                className="cz-home-photo-illustration object-cover"
              />
              <figcaption>
                <span>Marshall, Minnesota</span>
                <strong>the crew, in real life</strong>
              </figcaption>
              <div className="cz-home-photo-stats" aria-label="Codyza at a glance">
                <div><strong>{memberCount}</strong><span>members</span></div>
                <div><strong>{liveCount}</strong><span>launches</span></div>
                <div><strong>$0</strong><span>to join</span></div>
              </div>
            </figure>
          </FadeInView>

          <div className="cz-home-story-side">
            <FadeInView variant="subtle" delay={80} className="cz-home-id-card">
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
            </FadeInView>

            <FadeInView variant="subtle" delay={150}>
              <div className="cz-home-path" aria-label="The Codyza path">
                {CREW_PATH.map((step, index) => (
                  <div key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </FadeInView>
          </div>
        </div>
      </div>
    </section>
  )
}
