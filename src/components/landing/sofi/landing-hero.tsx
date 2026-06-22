"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SITE_CONFIG } from "@/constants/site"
import { StarfieldCanvas } from "./starfield-canvas"
import { TerminalAnimation } from "@/components/effects/terminal-animation"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const HERO_WORDS = ["building", "alone", "gets", "lonely."]

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const graphicRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !sectionRef.current) return
    let cleaned = false
    const tweens: { kill: () => void }[] = []

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)

      const wordEls = sectionRef.current!.querySelectorAll("[data-hero-word]")
      if (wordEls.length) {
        const tween = gsap.fromTo(
          wordEls,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.12, ease: "power4.out", delay: 0.15 }
        )
        tweens.push(tween)
      }

      if (graphicRef.current) {
        const tween = gsap.to(graphicRef.current, {
          y: 80,
          rotate: 3,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        tweens.push(tween)
        if (tween.scrollTrigger) tweens.push({ kill: () => tween.scrollTrigger!.kill() })
      }
    })

    return () => {
      cleaned = true
      tweens.forEach((t) => t.kill())
    }
  }, [reduced])

  return (
    <section ref={sectionRef} className="landing-dark relative flex min-h-screen items-center overflow-hidden px-6 pt-20 md:px-10">
      <StarfieldCanvas />
      <span className="landing-section-num absolute left-6 top-24 md:left-10">001</span>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#c9c4b3]/20 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5e8b6e] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5e8b6e]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#8a887e]">
              now onboarding founding contributors
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-fraunces)] text-[clamp(2.75rem,8vw,5.5rem)] font-light leading-[0.95] lowercase tracking-tight text-[#f4f2ec]">
            {HERO_WORDS.map((word, i) => (
              <span key={word} className="mr-[0.22em] inline-block overflow-hidden align-bottom">
                <span
                  data-hero-word
                  className={`inline-block opacity-100 ${i >= 2 ? "italic text-[#c9c4b3]" : ""}`}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <p className="mt-8 max-w-lg font-[family-name:var(--font-inter)] text-sm leading-relaxed text-[#8a887e] md:text-base">
            Codyza is a community of devs, designers, and dreamers shipping real projects together.
            Not a bootcamp. Not another chat server. Free to join, built to last.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/apply" className="inline-flex items-center gap-2 rounded-full border border-[#c9c4b3]/40 bg-[#c9c4b3]/10 px-6 py-3 font-[family-name:var(--font-inter)] text-xs lowercase tracking-wide text-[#f4f2ec] transition hover:bg-[#c9c4b3]/20">
              apply to join
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/projects" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-[family-name:var(--font-inter)] text-xs lowercase tracking-wide text-[#8a887e] transition hover:text-[#f4f2ec]">
              see what we&apos;re building →
            </Link>
          </div>

          <p className="mt-6 font-mono text-[10px] lowercase text-[#8a887e]/70">
            {SITE_CONFIG.tagline.toLowerCase()}
          </p>
        </div>

        <div ref={graphicRef} className="flex justify-center lg:justify-end">
          <TerminalAnimation />
        </div>
      </div>
    </section>
  )
}
