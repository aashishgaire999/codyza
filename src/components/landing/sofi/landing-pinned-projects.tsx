"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

type Project = {
  id: string
  name: string
  stack: string
  status: string
  impact: string
  codyza_id: string
  live_url: string | null
  github_url: string
}

const STATUS_LABEL: Record<string, string> = {
  approved: "live",
  pending: "in review",
  reviewed: "building",
}

export function LandingPinnedProjects() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("submissions")
        .select("id, project_name, tech_stack, description, status, xp_earned, codyza_id, live_url, github_url")
        .in("status", ["approved", "pending", "reviewed"])
        .order("submitted_at", { ascending: false })
        .limit(4)

      if (data?.length) {
        setProjects(
          data.map((p) => ({
            id: p.id,
            name: p.project_name,
            stack: (p.tech_stack || []).slice(0, 4).join(" · ").toLowerCase() || "—",
            status: STATUS_LABEL[p.status] || p.status,
            impact: p.description?.slice(0, 80) || `+${p.xp_earned || 0} xp`,
            codyza_id: p.codyza_id,
            live_url: p.live_url,
            github_url: p.github_url,
          }))
        )
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (reduced || !containerRef.current || !trackRef.current || projects.length === 0) return
    let cleaned = false

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned || !trackRef.current) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)
      const totalPanels = projects.length + 1

      const tween = gsap.to(trackRef.current, {
        x: () => -(trackRef.current!.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * Math.max(2, totalPanels * 0.85)}`,
          pin: true,
          scrub: true,
          onUpdate: (self) => setActive(Math.min(totalPanels - 1, Math.floor(self.progress * totalPanels))),
        },
      })

      return () => tween.scrollTrigger?.kill()
    })

    return () => { cleaned = true }
  }, [reduced, projects.length])

  if (projects.length === 0) return null

  if (reduced) {
    return (
      <section className="landing-light px-6 py-28 md:px-10">
        <h2 className="font-[family-name:var(--font-fraunces)] text-4xl font-light lowercase text-[#16150f]">projects we ship</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <article key={p.id} className="border-t border-[#16150f]/10 pt-4">
              <h3 className="font-[family-name:var(--font-fraunces)] text-2xl lowercase">{p.name}</h3>
              <p className="mt-2 text-sm text-[#16150f]/60">{p.stack}</p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  const allPanels = [{ intro: true }, ...projects]

  return (
    <div ref={containerRef} className="relative" style={{ height: `${Math.max(300, (projects.length + 1) * 85)}vh` }}>
      <section className="landing-light sticky top-0 flex h-screen flex-col overflow-hidden">
        <span className="landing-section-num absolute left-6 top-8 z-10 text-[#16150f]/30 md:left-10">004</span>

        <div ref={trackRef} className="flex h-full w-max items-stretch">
          <div data-panel className="flex h-full w-screen shrink-0 flex-col justify-center px-6 md:px-16">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#16150f]/40">shipping</p>
            <h2 className="mt-4 max-w-xl font-[family-name:var(--font-fraunces)] text-[clamp(2.5rem,6vw,4.5rem)] font-light lowercase leading-tight text-[#16150f]">
              what the crew is building right now
            </h2>
            <p className="mt-6 max-w-sm text-sm text-[#16150f]/55">Scroll to explore live and in-progress work from Codyza contributors.</p>
          </div>

          {projects.map((p, i) => (
            <div key={p.id} data-panel className="flex h-full w-screen shrink-0 items-center px-6 md:px-16">
              <div className="grid w-full max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_auto]">
                <div>
                  <span className="font-mono text-xs text-[#16150f]/35">{String(i + 1).padStart(2, "0")}/{String(projects.length).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-[family-name:var(--font-fraunces)] text-[clamp(2rem,5vw,3.5rem)] font-light lowercase text-[#16150f]">{p.name}</h3>
                  <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#16150f]/10 pt-8 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#16150f]/35">stack</p>
                      <p className="mt-1 lowercase text-[#16150f]/70">{p.stack}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#16150f]/35">status</p>
                      <p className="mt-1 lowercase text-[#16150f]/70">{p.status}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#16150f]/35">contributor</p>
                      <p className="mt-1 font-mono text-xs text-[#16150f]/70">{p.codyza_id}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-widest text-[#16150f]/35">impact</p>
                      <p className="mt-1 lowercase text-[#16150f]/70">{p.impact}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4 text-xs lowercase">
                    {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-[#16150f]/60 hover:text-[#16150f]">live demo →</a>}
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[#16150f]/60 hover:text-[#16150f]">github →</a>}
                  </div>
                </div>
                <svg className="hidden h-48 w-48 opacity-20 lg:block" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="40" stroke="#16150f" strokeWidth="0.5" fill="none" />
                  <line x1="50" y1="10" x2="50" y2="90" stroke="#16150f" strokeWidth="0.5" />
                  <line x1="10" y1="50" x2="90" y2="50" stroke="#16150f" strokeWidth="0.5" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-6 flex gap-2 md:left-10">
          {allPanels.map((_, i) => (
            <span key={i} className={`block h-2 rounded-full transition-all duration-300 ${active === i ? "w-6 bg-[#16150f]" : "w-2 bg-[#16150f]/20"}`} />
          ))}
        </div>
        <Link href="/projects" className="absolute bottom-8 right-6 text-xs lowercase text-[#16150f]/50 hover:text-[#16150f] md:right-10">view all →</Link>
      </section>
    </div>
  )
}
