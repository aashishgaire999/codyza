"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

function CountUp({ target, suffix = "", decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) { setVal(target); return }
    const el = ref.current
    if (!el) return
    let cleaned = false

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => setVal(decimals ? parseFloat(obj.v.toFixed(decimals)) : Math.round(obj.v)),
      })
    })

    return () => { cleaned = true }
  }, [target, decimals, reduced])

  return (
    <span ref={ref}>
      {decimals ? val.toFixed(decimals) : val}{suffix}
    </span>
  )
}

export function LandingStats() {
  const bigRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !bigRef.current) return
    let cleaned = false

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)
      gsap.from(bigRef.current, {
        scale: 0.6,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.4)",
        scrollTrigger: { trigger: bigRef.current, start: "top 80%", once: true },
      })
    })

    return () => { cleaned = true }
  }, [reduced])

  return (
    <section className="landing-dark relative px-6 py-28 md:px-10 md:py-36">
      <span className="landing-section-num absolute left-6 text-[#f4f2ec]/20 md:left-10">003</span>

      <div className="mx-auto max-w-5xl text-center">
        <div ref={bigRef} className="font-[family-name:var(--font-fraunces)] text-[clamp(4rem,15vw,9rem)] font-light lowercase leading-none text-[#f4f2ec]">
          <CountUp target={2.4} suffix="x" decimals={1} />
        </div>
        <p className="mx-auto mt-6 max-w-md font-[family-name:var(--font-inter)] text-sm lowercase text-[#8a887e]">
          average output when contributors ship on a team vs solo, based on early cohort data
        </p>

        <div className="mt-24 grid grid-cols-1 gap-12 border-t border-[#f4f2ec]/10 pt-16 md:grid-cols-3">
          {[
            { v: 48, s: "h", l: "application review time" },
            { v: 0, s: "", l: "membership fees", prefix: "$" },
            { v: 8, s: "", l: "contributor rank tiers" },
          ].map((stat) => (
            <div key={stat.l}>
              <div className="font-[family-name:var(--font-fraunces)] text-5xl font-light text-[#c9c4b3] md:text-6xl">
                {stat.prefix}<CountUp target={stat.v} suffix={stat.s} />
              </div>
              <p className="mt-3 font-[family-name:var(--font-inter)] text-xs lowercase text-[#8a887e]">{stat.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
