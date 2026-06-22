"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SITE_CONFIG } from "@/constants/site"
import { APPLY_ROADMAP } from "@/constants/landing"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function LandingApplyCta() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ref.current) return
    let cleaned = false
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      gsapMod.gsap.registerPlugin(stMod.ScrollTrigger)
      gsapMod.gsap.from(ref.current, {
        scale: 0.75,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      })
    })
    return () => { cleaned = true }
  }, [reduced])

  return (
    <section id="apply" className="landing-light scroll-mt-24 px-6 py-28 md:px-10 md:py-40">
      <span className="landing-section-num text-[#16150f]/30">006</span>
      <div ref={ref} className="mx-auto max-w-3xl text-center">
        <h2 className="font-[family-name:var(--font-fraunces)] text-[clamp(2.5rem,7vw,4.5rem)] font-light lowercase leading-tight text-[#16150f]">
          ready to join <span className="italic text-[#8a887e]">the crew?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md font-[family-name:var(--font-inter)] text-sm text-[#16150f]/55">
          Applications take ~3 minutes. We review every one within {SITE_CONFIG.reviewCycle}.
        </p>

        <div className="mt-14 grid gap-6 text-left sm:grid-cols-2">
          {APPLY_ROADMAP.map((step) => (
            <div key={step.num} className="border-t border-[#16150f]/10 pt-4">
              <span className="font-mono text-[10px] text-[#16150f]/35">{step.num}</span>
              <p className="mt-2 font-[family-name:var(--font-fraunces)] text-base lowercase text-[#16150f]">{step.title}</p>
              <p className="mt-1 text-xs text-[#16150f]/50">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full border border-[#16150f]/20 bg-[#16150f] px-8 py-3.5 font-[family-name:var(--font-inter)] text-xs lowercase text-[#f4f2ec]">
            apply to join
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/projects" className="font-[family-name:var(--font-inter)] text-xs lowercase text-[#16150f]/50 hover:text-[#16150f]">
            browse projects →
          </Link>
        </div>
      </div>
    </section>
  )
}
