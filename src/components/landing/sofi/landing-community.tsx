"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function LandingCommunity() {
  const sectionRef = useRef<HTMLElement>(null)
  const visualRef = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !visualRef.current || !sectionRef.current) return
    let cleaned = false

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cleaned) return
      const gsap = gsapMod.gsap
      gsap.registerPlugin(stMod.ScrollTrigger)

      gsap.fromTo(
        visualRef.current,
        { scale: 0.85, opacity: 0.3 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "center center",
            scrub: true,
          },
        }
      )
    })

    return () => { cleaned = true }
  }, [reduced])

  return (
    <section ref={sectionRef} className="landing-dark relative px-6 py-28 md:px-10 md:py-40">
      <span className="landing-section-num absolute left-6 top-10 md:left-10">005</span>

      <div className="mx-auto max-w-4xl text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-[clamp(1.75rem,5vw,3.25rem)] font-light italic leading-snug lowercase text-[#c9c4b3]">
          never ship alone — join a crew of builders who show up, review your work, and celebrate when it goes live.
        </p>

        <svg ref={visualRef} className="mx-auto mt-16 h-64 w-full max-w-md" viewBox="0 0 300 200" aria-hidden>
          {[
            [50, 100], [120, 60], [180, 120], [240, 70], [150, 150], [80, 160], [200, 40],
          ].map(([x, y], i) => (
            <g key={i}>
              {i > 0 && (
                <line
                  x1={[50, 120, 180, 240, 150, 80, 200][i - 1] ?? 50}
                  y1={[100, 60, 120, 70, 150, 160, 40][i - 1] ?? 100}
                  x2={x}
                  y2={y}
                  stroke="#c9c4b3"
                  strokeOpacity="0.25"
                  strokeWidth="0.5"
                />
              )}
              <circle cx={x} cy={y} r="4" fill="#c9c4b3" fillOpacity="0.6" />
            </g>
          ))}
        </svg>

        <blockquote className="mt-16 font-[family-name:var(--font-fraunces)] text-2xl font-light leading-relaxed lowercase text-[#f4f2ec] md:text-3xl">
          &ldquo;finally found people who actually want to build — not just talk about it.&rdquo;
        </blockquote>
        <cite className="mt-6 block font-[family-name:var(--font-inter)] text-xs lowercase not-italic text-[#8a887e]">
          @founding contributor
        </cite>
      </div>
    </section>
  )
}
