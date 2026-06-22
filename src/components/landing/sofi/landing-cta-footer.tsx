"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const TAGLINE = ["build in public", "grow as a team", "ship without fear"]

export function LandingCtaFooter() {
  const ctaRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ctaRef.current) return
    let cleaned = false

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)
      gsap.from(ctaRef.current, {
        scale: 0.75,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%", once: true },
      })
    })

    return () => { cleaned = true }
  }, [reduced])

  return (
    <>
      <section id="apply" className="landing-light scroll-mt-24 px-6 py-32 md:px-10 md:py-44">
        <span className="landing-section-num text-[#16150f]/30">006</span>
        <div ref={ctaRef} className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-fraunces)] text-[clamp(2.5rem,7vw,4.5rem)] font-light lowercase leading-tight text-[#16150f]">
            ready to join the crew?
          </h2>
          <p className="mx-auto mt-6 max-w-md font-[family-name:var(--font-inter)] text-sm text-[#16150f]/55">
            Applications take ~3 minutes. We review every one within 48 hours.
          </p>
          <Link
            href="/apply"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#16150f]/20 bg-[#16150f] px-8 py-3.5 font-[family-name:var(--font-inter)] text-xs lowercase tracking-wide text-[#f4f2ec] transition hover:opacity-90"
          >
            apply to join
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <footer className="landing-dark border-t border-[#f4f2ec]/10 px-6 py-16 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-x-8 gap-y-2 font-[family-name:var(--font-fraunces)] text-sm font-light lowercase italic text-[#8a887e] md:text-base">
            {TAGLINE.map((t, i) => (
              <span key={t}>
                {t}{i < TAGLINE.length - 1 ? " /" : ""}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-6 font-[family-name:var(--font-inter)] text-xs lowercase text-[#8a887e]">
            <Link href="/#about" className="hover:text-[#f4f2ec]">about</Link>
            <Link href="/apply" className="hover:text-[#f4f2ec]">apply</Link>
            <Link href="/projects" className="hover:text-[#f4f2ec]">projects</Link>
            <Link href="/leaderboard" className="hover:text-[#f4f2ec]">leaderboard</Link>
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-[#f4f2ec]">github</a>
            <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-[#f4f2ec]">contact</a>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-widest text-[#8a887e]/60">
            © {new Date().getFullYear()} {SITE_CONFIG.name.toLowerCase()}
          </p>
        </div>
      </footer>
    </>
  )
}
