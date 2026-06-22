"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

type Star = {
  x: number
  y: number
  r: number
  baseOpacity: number
  twinkleSpeed: number
  twinkleOffset: number
  layer: 0 | 1 | 2
}

const LAYER_CONFIG = [
  { count: 120, speed: 0.08, parallax: 0.06, maxR: 1.1 },
  { count: 70, speed: 0.15, parallax: 0.14, maxR: 1.6 },
  { count: 35, speed: 0.22, parallax: 0.26, maxR: 2.4 },
]

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let stars: Star[] = []
    let frame = 0
    let w = 0
    let h = 0

    const buildStars = () => {
      stars = []
      LAYER_CONFIG.forEach((layer, li) => {
        for (let i = 0; i < layer.count; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * layer.maxR + 0.3,
            baseOpacity: 0.15 + Math.random() * 0.55,
            twinkleSpeed: 0.004 + Math.random() * 0.012,
            twinkleOffset: Math.random() * Math.PI * 2,
            layer: li as 0 | 1 | 2,
          })
        }
      })
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * devicePixelRatio
      canvas.height = h * devicePixelRatio
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      buildStars()
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h }
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMove)

    let raf = 0
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const mx = (mouseRef.current.x - 0.5) * 2
      const my = (mouseRef.current.y - 0.5) * 2

      for (const star of stars) {
        const cfg = LAYER_CONFIG[star.layer]
        const driftX = Math.sin(t * cfg.speed * 0.001 + star.twinkleOffset) * 8
        const driftY = Math.cos(t * cfg.speed * 0.0008 + star.twinkleOffset) * 6
        const px = star.x + driftX + mx * cfg.parallax * 26
        const py = star.y + driftY + my * cfg.parallax * 26
        const twinkle = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinkleOffset)
        const opacity = star.baseOpacity * (0.4 + twinkle * 0.6)

        ctx.beginPath()
        ctx.arc(px, py, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(244, 242, 236, ${opacity})`
        ctx.fill()

        if (star.layer === 2 && twinkle > 0.92) {
          const g = ctx.createRadialGradient(px, py, 0, px, py, star.r * 6)
          g.addColorStop(0, `rgba(201, 196, 179, ${opacity * 0.35})`)
          g.addColorStop(1, "rgba(201, 196, 179, 0)")
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, star.r * 6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
    }
  }, [reduced])

  if (reduced) {
    return <div className="absolute inset-0 bg-[#0a0a08]" aria-hidden />
  }

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
}
