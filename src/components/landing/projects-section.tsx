"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail, GitBranch } from "lucide-react"
import { SITE_CONFIG } from "@/constants/site"
import { FOUNDING_TEAM, LEADERSHIP_TEAM } from "@/constants/team"
import { createClient } from "@/lib/supabase"
import { SectionBadge } from "@/components/shared/section-badge"
import { FadeIn } from "@/components/motion/fade-in"

interface Contributor {
  codyza_id: string
  name: string
  email: string
  avatar_url?: string
}

export function ProjectsSection() {
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({})
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function loadAvatars() {
      const supabase = createClient()
      const { data } = await supabase.from("contributors").select("name, avatar_url")
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((c: { name: string; avatar_url?: string }) => {
          if (c.avatar_url) map[c.name] = c.avatar_url
        })
        setAvatarMap(map)
      }
    }
    loadAvatars()
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data }, { data: userData }] = await Promise.all([
        supabase.from("contributors").select("codyza_id, name, email, avatar_url").eq("is_admin", false).not("codyza_id", "in", "(CZX-0001,CZX-0002,CZX-0003,CZX-0004,CZX-0005)"),
        supabase.auth.getUser(),
      ])
      setContributors(data || [])
      setIsLoggedIn(!!userData?.user)
    }
    load()
  }, [])

  const marqueeList =
    contributors.length > 0
      ? Array.from({ length: Math.max(2, Math.ceil(20 / contributors.length)) }).flatMap(() => contributors)
      : []

  function getInitials(name: string) {
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
  }

  return (
    <section id="team" className="border-t border-border px-6 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <span className="landing-section-num mb-8 block">005</span>
        <div className="mb-12 text-center">
          <SectionBadge className="mb-4">Team</SectionBadge>
          <h3 className="font-[family-name:var(--font-fraunces)] text-[clamp(2rem,5vw,3.5rem)] font-light lowercase">
            the people behind codyza
          </h3>
        </div>

        <div className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {FOUNDING_TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="surface-card p-8 text-center"
            >
              <div
                className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full font-mono text-xl font-semibold"
                style={{ background: `color-mix(in srgb, ${member.color} 20%, var(--card))`, border: `2px solid color-mix(in srgb, ${member.color} 40%, transparent)` }}
              >
                {avatarMap[member.name] ? <img src={avatarMap[member.name]} alt={member.name} className="h-full w-full object-cover" /> : member.initials}
              </div>
              <h4 className="font-[family-name:var(--font-fraunces)] text-xl font-light">{member.name}</h4>
              <p className="mt-1 text-sm text-accent">{member.role}</p>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">{member.bio}</p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <a href={member.github} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
                  <GitBranch className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LEADERSHIP_TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="surface-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full font-mono text-lg" style={{ background: "var(--muted)" }}>
                {avatarMap[member.name] ? <img src={avatarMap[member.name]} alt={member.name} className="h-full w-full object-cover" /> : member.initials}
              </div>
              <h4 className="font-[family-name:var(--font-fraunces)] text-lg font-light">{member.name}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>

        <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">contributors</p>
        <div className="relative mb-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          {marqueeList.length > 0 ? (
            <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-3">
              {marqueeList.map((c, i) => (
                <div key={`${c.codyza_id}-${i}`} className="flex shrink-0 items-center gap-2.5 rounded-full border border-border bg-muted px-3.5 py-2">
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent/20 font-mono text-[10px]">
                    {c.avatar_url ? <img src={c.avatar_url} alt={c.name} className="h-full w-full object-cover" /> : getInitials(c.name)}
                  </div>
                  <span className="text-sm">{c.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center">
              <a href="/apply" className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                Be the first contributor →
              </a>
            </div>
          )}
        </div>

        <FadeIn className="text-center">
          <Mail className="mx-auto mb-4 h-8 w-8 text-accent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">contact</p>
          <a href={`mailto:${SITE_CONFIG.email}`} className="mt-4 inline-block text-xl font-semibold text-accent hover:opacity-80">
            {SITE_CONFIG.email}
          </a>
        </FadeIn>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
