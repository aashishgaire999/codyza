"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase"
import { FOUNDING_TEAM, LEADERSHIP_TEAM } from "@/constants/team"
import { FadeInView } from "@/components/effects/fade-in-view"

const CREW = [...FOUNDING_TEAM, ...LEADERSHIP_TEAM]

export function Team() {
  const [avatars, setAvatars] = useState<Map<string, string>>(new Map())
  const [contributors, setContributors] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("contributors").select("codyza_id, name, avatar_url")
      if (!data) return
      const map = new Map<string, string>()
      for (const c of data) {
        if (c.avatar_url) map.set(c.name.toLowerCase(), c.avatar_url)
      }
      setAvatars(map)
      const founderNames = new Set(CREW.map((m) => m.name.toLowerCase()))
      setContributors(data.filter((c: any) => !founderNames.has((c.name || "").toLowerCase())))
    }
    load()
  }, [])

  return (
    <section id="team" className="cz-section scroll-mt-24 cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <FadeInView variant="headline">
          <p className="cz-micro mb-8">007 / the crew</p>
          <h2 className="cz-display max-w-3xl">
            the people <span className="cz-headline-muted">behind codyza.</span>
          </h2>
        </FadeInView>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CREW.map((member, i) => {
            const avatarUrl = avatars.get(member.name.toLowerCase())
            return (
              <FadeInView key={member.name} delay={i * 60}>
                <article className="cz-card h-full p-6">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={member.name}
                      width={48}
                      height={48}
                      className="mb-5 h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl font-mono text-sm font-bold text-white"
                      style={{ background: member.color }}
                    >
                      {member.initials}
                    </div>
                  )}
                  <h3 className="font-[family-name:var(--font-instrument)] text-xl lowercase">
                    {member.name}
                  </h3>
                  <p className="cz-micro mt-1.5">{member.role.toLowerCase()}</p>
                  <p className="cz-body mt-3 text-[13px]">{member.bio}</p>
                </article>
              </FadeInView>
            )
          })}
        </div>

        {contributors.length > 0 && (
          <FadeInView delay={200}>
            <div className="mt-16 border-t border-[var(--cz-line)] pt-10">
              <p className="cz-micro mb-6">contributors</p>
              <div className="cz-marquee-viewport">
                <div className="cz-marquee-track">
                  {[0, 1].map((pass) => (
                    <div key={pass} className="cz-marquee-group" aria-hidden={pass === 1}>
                      {contributors.map((c) => (
                        <div
                          key={`${pass}-${c.codyza_id}`}
                          className="flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--cz-line)] bg-[var(--cz-canvas-raised)] py-2 pl-2 pr-4"
                        >
                          {c.avatar_url ? (
                            <Image
                              src={c.avatar_url}
                              alt={c.name}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cz-accent)]/10 font-mono text-[10px] font-bold text-[var(--cz-accent)]">
                              {(c.name || "?").split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                          )}
                          <span className="text-[13px] lowercase text-[var(--cz-ink)]">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInView>
        )}
      </div>
    </section>
  )
}
