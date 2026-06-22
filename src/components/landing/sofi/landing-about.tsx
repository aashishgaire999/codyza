"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const CARDS = [
  {
    num: "i.",
    title: "ship together",
    desc: "Join project teams, review PRs, and deploy to production with people who actually show up.",
  },
  {
    num: "ii.",
    title: "earn your rank",
    desc: "Every contribution earns XP. Level from Apprentice to Codyza Fellow as you grow.",
  },
  {
    num: "iii.",
    title: "build in public",
    desc: "Your work goes live on the internet — real users, real feedback, real portfolio.",
  },
]

export function LandingAbout() {
  const sectionRef = useRef<HTMLElement>(null)
  const geoRef = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !sectionRef.current) return
    let cleaned = false

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)

      gsap.from(sectionRef.current!.querySelectorAll("[data-about-card]"), {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      })

      if (geoRef.current) {
        gsap.to(geoRef.current, {
          rotate: 18,
          x: 30,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      }
    })

    return () => { cleaned = true }
  }, [reduced])

  return (
    <section ref={sectionRef} id="about" className="landing-light relative overflow-hidden px-6 py-28 md:px-10 md:py-36">
      <span className="landing-section-num absolute left-6 top-10 text-[#16150f]/30 md:left-10">002</span>

      <svg ref={geoRef} className="pointer-events-none absolute right-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 opacity-[0.07]" viewBox="0 0 200 200" aria-hidden>
        <circle cx="100" cy="100" r="80" stroke="#16150f" strokeWidth="0.5" fill="none" />
        <circle cx="100" cy="100" r="50" stroke="#16150f" strokeWidth="0.5" fill="none" />
        <circle cx="100" cy="100" r="20" stroke="#16150f" strokeWidth="0.5" fill="none" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="#16150f" strokeWidth="0.5" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="#16150f" strokeWidth="0.5" />
      </svg>

      <div className="relative mx-auto max-w-5xl">
        <p className="font-[family-name:var(--font-fraunces)] text-[clamp(1.75rem,4.5vw,3rem)] font-light leading-snug lowercase text-[#16150f]">
          we built codyza because shipping alone is slow — a community where beginners and intermediates collaborate on real-world projects, deploy AI tools, and grow through a gamified contributor system.
        </p>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {CARDS.map((c) => (
            <article key={c.num} data-about-card className="border-t border-[#16150f]/10 pt-6">
              <span className="font-[family-name:var(--font-fraunces)] text-sm italic text-[#16150f]/40">{c.num}</span>
              <h3 className="mt-3 font-[family-name:var(--font-fraunces)] text-xl font-normal lowercase text-[#16150f]">{c.title}</h3>
              <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-relaxed text-[#16150f]/60">{c.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
