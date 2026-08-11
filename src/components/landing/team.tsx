"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { FOUNDING_TEAM, LEADERSHIP_TEAM } from "@/constants/team"
import { createClient } from "@/lib/supabase"
import { FadeInView } from "@/components/effects/fade-in-view"

const FOUNDERS = [...FOUNDING_TEAM, ...LEADERSHIP_TEAM]
const FOUNDER_NAMES = new Set(FOUNDERS.map((member) => member.name.toLowerCase()))

type Contributor = {
  codyza_id: string
  name: string
  avatar_url: string | null
  role: string | null
  joined_at: string | null
}

function PersonAvatar({
  initials,
  color,
  avatarUrl,
  compact = false,
}: {
  initials: string
  color: string
  avatarUrl?: string | null
  compact?: boolean
}) {
  if (avatarUrl) {
    return (
      <span className={compact ? "cz-contributor-avatar" : "cz-founder-avatar"}>
        <Image src={avatarUrl} alt="" fill sizes={compact ? "36px" : "144px"} className="object-cover" />
      </span>
    )
  }

  return (
    <span
      className={compact ? "cz-contributor-avatar" : "cz-founder-avatar"}
      style={{ background: color }}
      aria-hidden
    >
      {compact ? initials.slice(0, 2) : initials}
    </span>
  )
}

export function Team() {
  const [members, setMembers] = useState<Contributor[]>([])

  useEffect(() => {
    let active = true

    async function loadMembers() {
      const supabase = createClient()
      const { data } = await supabase
        .from("contributors")
        .select("codyza_id, name, avatar_url, role, joined_at")
        .order("joined_at", { ascending: true })

      if (active) setMembers((data as Contributor[] | null) || [])
    }

    void loadMembers()
    return () => { active = false }
  }, [])

  const contributors = members.filter((member) => {
    const name = member.name.trim().toLowerCase()
    return name && !name.includes("test") && !FOUNDER_NAMES.has(name)
  })
  const ribbon = contributors.length > 0 ? [...contributors, ...contributors] : []

  return (
    <section id="team" className="cz-team-stage scroll-mt-24 px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <FadeInView variant="subtle">
          <p className="cz-team-kicker">the crew</p>
        </FadeInView>
        <FadeInView variant="headline">
          <h2>the people behind Codyza.</h2>
        </FadeInView>

        <div className="cz-founders-grid">
          {FOUNDERS.map((founder, index) => {
            const profile = members.find((member) => member.name.toLowerCase() === founder.name.toLowerCase())
            return (
              <FadeInView key={founder.name} delay={index * 65} className="cz-founder-person">
                <PersonAvatar
                  initials={founder.initials}
                  color={founder.color}
                  avatarUrl={profile?.avatar_url}
                />
                <h3>{founder.name}</h3>
                <p>{founder.role}</p>
              </FadeInView>
            )
          })}
        </div>

        <div className="cz-contributor-area">
          <div className="cz-contributor-heading">
            <span>contributors</span>
            <Link href="/leaderboard">
              see everyone
            </Link>
          </div>

          {ribbon.length > 0 ? (
            <div className="cz-contributor-window">
              <div className="cz-contributor-track">
                {ribbon.map((member, index) => {
                  const initials = member.name.split(" ").map((part) => part[0]).join("")
                  return (
                    <Link
                      key={`${member.codyza_id}-${index}`}
                      href={`/contributor/${member.codyza_id.toLowerCase()}`}
                      className="cz-contributor-pill"
                      aria-hidden={index >= contributors.length}
                      tabIndex={index >= contributors.length ? -1 : undefined}
                    >
                      <PersonAvatar
                        initials={initials}
                        color="#302bfb"
                        avatarUrl={member.avatar_url}
                        compact
                      />
                      <span>{member.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="cz-contributor-empty">Member names and photos appear here as profiles are completed.</p>
          )}
        </div>
      </div>
    </section>
  )
}
