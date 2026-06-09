"use client"

import { useEffect, useRef } from "react"

const CODE_LINES = [
  "const xp = await supabase.from(\"xp\").select()",
  "export async function reviewCode(input: string)",
  "if (rank >= THRESHOLDS.SENIOR) promote()",
  "router.push(\"/member/dashboard\")",
  "const { data } = useContributor(czxId)",
  "await gemini.generateContent(prompt)",
  "setRank(calculateRank(totalXP))",
  "supabase.auth.signInWithOtp({ email })",
  "type Contributor = { czxId: string; xp: number }",
  "const score = await aiReview(githubUrl)",
  "await supabase.from(\"notifications\").insert(n)",
  "export const RANK_XP = [0,500,1500,3000]",
]

const COLORS = ["#a78bfa", "#67e8f9", "#86efac", "#93c5fd"]

export function FloatingCode() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements: HTMLElement[] = []

    CODE_LINES.forEach((text, i) => {
      const el = document.createElement("div")
      el.textContent = text
      el.style.cssText = [
        "position:absolute",
        "font-family:monospace",
        "font-size:11px",
        "white-space:nowrap",
        "pointer-events:none",
        "opacity:0",
        `color:${COLORS[i % COLORS.length]}`,
        `left:${5 + Math.random() * 80}%`,
        `top:${10 + Math.random() * 75}%`,
      ].join(";")

      container.appendChild(el)
      elements.push(el)

      let start: number
      const duration = 14000 + Math.random() * 8000
      const delay = i * 1800

      function animate(ts: number) {
        if (!start) start = ts
        const elapsed = (ts - start + delay) % (duration + 3000)
        let opacity = 0
        if (elapsed < 1500) {
          opacity = (elapsed / 1500) * 0.12
        } else if (elapsed < duration) {
          opacity = 0.12 - ((elapsed - 1500) / (duration - 1500)) * 0.12
        }
        const translateY = -(elapsed / duration) * 80
        el.style.opacity = String(opacity)
        el.style.transform = `translateY(${translateY}px)`
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    })

    return () => {
      elements.forEach(el => el.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  )
}