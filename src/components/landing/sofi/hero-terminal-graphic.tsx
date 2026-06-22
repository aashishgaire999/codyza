"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export function HeroTerminalGraphic() {
  const svgRef = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !svgRef.current) return

    let ctx: { revert: () => void } | null = null

    import("gsap").then(({ gsap }) => {
      const paths = svgRef.current!.querySelectorAll<SVGPathElement | SVGLineElement>("[data-draw]")
      paths.forEach((path) => {
        const len = "getTotalLength" in path ? path.getTotalLength() : 100
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      })
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 2.2,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.6,
      })

      gsap.to("[data-float-a]", {
        y: -10,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to("[data-float-b]", {
        y: 8,
        duration: 4.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      })

      ctx = { revert: () => gsap.killTweensOf("*") }
    })

    return () => ctx?.revert()
  }, [reduced])

  return (
    <div className="relative w-full max-w-md lg:max-w-lg">
      <svg
        ref={svgRef}
        viewBox="0 0 420 320"
        fill="none"
        className="w-full drop-shadow-2xl"
        aria-hidden
      >
        <rect x="20" y="20" width="380" height="280" rx="16" stroke="#c9c4b3" strokeOpacity="0.35" strokeWidth="1.5" data-draw />
        <line x1="20" y1="56" x2="400" y2="56" stroke="#c9c4b3" strokeOpacity="0.2" strokeWidth="1" data-draw />
        <circle cx="44" cy="38" r="5" fill="#8a887e" fillOpacity="0.5" />
        <circle cx="64" cy="38" r="5" fill="#8a887e" fillOpacity="0.35" />
        <circle cx="84" cy="38" r="5" fill="#8a887e" fillOpacity="0.25" />

        <path d="M48 92h280" stroke="#f4f2ec" strokeOpacity="0.5" strokeWidth="1.5" data-draw />
        <path d="M48 118h220" stroke="#8a887e" strokeWidth="1.5" data-draw />
        <path d="M48 144h180" stroke="#8a887e" strokeWidth="1.5" data-draw />
        <path d="M48 170h240" stroke="#8a887e" strokeWidth="1.5" data-draw />
        <path d="M48 196h160" stroke="#c9c4b3" strokeOpacity="0.6" strokeWidth="1.5" data-draw />
        <path d="M48 222h200" stroke="#8a887e" strokeWidth="1.5" data-draw />
        <path d="M48 248h140" stroke="#8a887e" strokeWidth="1.5" data-draw />

        <rect x="48" y="262" width="10" height="18" fill="#c9c4b3" className="animate-pulse" />

        <g data-float-a>
          <circle cx="360" cy="100" r="22" stroke="#c9c4b3" strokeWidth="1.5" data-draw />
          <path d="M352 100l6 6 12-12" stroke="#c9c4b3" strokeWidth="2" strokeLinecap="round" data-draw />
        </g>

        <g data-float-b>
          <rect x="320" y="200" width="64" height="40" rx="8" stroke="#c9c4b3" strokeOpacity="0.5" strokeWidth="1.5" data-draw />
          <path d="M332 228v-16M348 228v-22M364 228v-10" stroke="#f4f2ec" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" data-draw />
        </g>
      </svg>
    </div>
  )
}
