"use client"

import { useEffect, useRef } from "react"
import { LANDING_MARQUEE_WORDS } from "@/constants/landing"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function LandingMarquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !trackRef.current) return
    let anim: { kill: () => void; timeScale: (n: number) => void } | null = null
    let cleaned = false

    import("gsap").then(({ gsap }) => {
      if (cleaned || !trackRef.current) return
      const width = trackRef.current.scrollWidth / 2
      anim = gsap.to(trackRef.current, { x: -width, duration: 40, ease: "none", repeat: -1 })

      const observer = new IntersectionObserver(
        ([entry]) => { if (anim) gsap.to(anim, { timeScale: entry.isIntersecting ? 1.4 : 1, duration: 0.6, ease: "power2.out" }) },
        { threshold: 0.2 }
      )
      if (wrapRef.current) observer.observe(wrapRef.current)
    })

    return () => { cleaned = true; anim?.kill() }
  }, [reduced])

  const items = [...LANDING_MARQUEE_WORDS, ...LANDING_MARQUEE_WORDS]

  return (
    <div ref={wrapRef} className="landing-dark overflow-hidden border-y border-[#f4f2ec]/10 py-5">
      <div ref={trackRef} className="flex w-max gap-12 px-6">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="font-[family-name:var(--font-fraunces)] text-lg font-light lowercase tracking-wide text-[#8a887e] md:text-2xl">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
