"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { SITE_CONFIG } from "@/constants/site"
import { createClient } from "@/lib/supabase"

const TIER_ONE = [
  {
    name: "Ayush Gaire",
    initials: "AG",
    role: "Founder & CEO",
    color: "#3b82f6",
  },
  {
    name: "Prashant Subedi",
    initials: "PS",
    role: "Founding Partner",
    color: "#f59e0b",
  },
]

const TIER_TWO = [
  {
    name: "Swroop Neupane",
    initials: "SN",
    role: "Founding Head of Talent",
    color: "#22c55e",
  },
  {
    name: "Anirudra Rayamajhi",
    initials: "AR",
    role: "Co-Founder",
    color: "#06b6d4",
  },
  {
    name: "Ashish Gaire",
    initials: "ASG",
    role: "Co-Founder & CTO",
    color: "#8b5cf6",
  },
]

interface Contributor {
  codyza_id: string
  name: string
  email: string
}

export function ProjectsSection() {
  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadAvatars() {
      const supabase = createClient()
      const { data } = await supabase
        .from("contributors")
        .select("name, avatar_url")
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((c: any) => { if (c.avatar_url) map[c.name] = c.avatar_url })
        setAvatarMap(map)
      }
    }
    loadAvatars()
  }, [])
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data }, { data: userData }] = await Promise.all([
        supabase
          .from("contributors")
          .select("codyza_id, name, email")
          .eq("is_admin", false)
          .not("codyza_id", "in", "(CZX-0001,CZX-0002,CZX-0003,CZX-0004,CZX-0005)"),
        supabase.auth.getUser(),
      ])
      setContributors(data || [])
      setIsLoggedIn(!!userData?.user)
    }
    load()
  }, [])

  // Duplicate the list for seamless marquee loop
  // Repeat enough times to fill viewport with no gap, even for small lists
  const marqueeList =
    contributors.length > 0
      ? Array.from({ length: Math.max(2, Math.ceil(20 / contributors.length)) })
          .flatMap(() => contributors)
      : []

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <section
      id="team"
      className="relative overflow-hidden border-t border-white/[0.05] bg-transparent py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            The Crew
          </div>
          <h3 className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight text-white md:text-5xl">
            The people behind Codyza.
          </h3>
        </div>

        {/* TIER 1: Founder & CEO + Founding Partner */}
        <div className="mb-8 mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          {TIER_ONE.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="team-card-glow"
            >
              <div className="team-card-inner">
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full font-mono text-lg font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}, #111827)`,
                  }}
                >
                  {avatarMap[member.name]
                    ? <img src={avatarMap[member.name]} alt={member.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                    : member.initials
                  }
                </div>
                <h4 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                  {member.name}
                </h4>
                <p className="mt-1.5 text-sm text-zinc-400">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TIER 2: Founding leadership */}
        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TIER_TWO.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="team-card-glow"
            >
              <div className="team-card-inner">
                <div
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full font-mono text-lg font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}, #111827)`,
                  }}
                >
                  {avatarMap[member.name]
                    ? <img src={avatarMap[member.name]} alt={member.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>
                    : member.initials
                  }
                </div>
                <h4 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
                  {member.name}
                </h4>
                <p className="mt-1.5 text-sm text-zinc-400">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CONTRIBUTORS MARQUEE */}
        <div className="mb-3 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
          Contributors
        </div>
        <div className="marquee-container mb-16">
          {marqueeList.length > 0 ? (
            <div className="marquee-track">
              {marqueeList.map((c, i) => {
                const pillInner = (
                  <>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] font-mono text-[10px] font-semibold text-white">
                      {getInitials(c.name)}
                    </div>
                    <span className="text-sm text-zinc-300">{c.name}</span>
                  </>
                )
                const pillClass =
                  "flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.05] bg-white/[0.02] px-3.5 py-2"

                if (isLoggedIn) {
                  return (
                    <div
                      key={`${c.codyza_id}-${i}`}
                      className={`${pillClass} group relative cursor-pointer transition-colors hover:border-white/[0.15] hover:bg-white/[0.04]`}
                    >
                      {pillInner}
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0a0f] px-3 py-1.5 text-xs text-zinc-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                        {c.email}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={`${c.codyza_id}-${i}`} className={pillClass}>
                    {pillInner}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex justify-center">
              <a
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Be the first contributor &rarr;
              </a>
            </div>
          )}
        </div>

        {/* CONTACT */}
        <div className="mt-16 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
          </div>

          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Contact Codyza
          </p>

          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="mt-4 inline-block text-2xl font-semibold text-blue-400 transition hover:text-blue-300"
          >
            {SITE_CONFIG.email}
          </a>
        </div>

      </div>

      <style jsx>{`
        .team-card-glow {
          position: relative;
          border-radius: 16px;
          padding: 1.5px;
          overflow: hidden;
          isolation: isolate;
        }
        .team-card-glow::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            #8b5cf6,
            #3b82f6,
            #06b6d4,
            #22c55e,
            #f59e0b,
            #8b5cf6
          );
          transform: translate(-50%, -50%) rotate(0deg);
          animation: spin-conic 5s linear infinite;
          z-index: -1;
        }
        .team-card-inner {
          position: relative;
          border-radius: 14.5px;
          background: #0a0a14;
          padding: 28px 24px;
          text-align: center;
          height: 100%;
          z-index: 1;
        }
        @keyframes spin-conic {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .marquee-container {
          position: relative;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
        .marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

    </section>
  )
}
