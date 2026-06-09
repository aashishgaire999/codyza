"use client"

import { useEffect, useRef, useState } from "react"

interface Star {
  x: number; y: number; z: number
  size: number; brightness: number
  twinkleSpeed: number; twinkleOffset: number
  color: string; type: "star" | "core" | "brand"
}

interface ShootingStar {
  x: number; y: number
  vx: number; vy: number
  life: number; maxLife: number
  active: boolean
}

const STAR_COLORS = [
  "255,255,255", "255,255,255", "255,255,255",
  "200,210,255", "255,240,200", "180,180,255",
]

const BRAND_COLORS = [
  "167,139,250", "103,232,249", "34,197,94",
  "124,58,237", "37,99,235",
]

function isLowEnd(): boolean {
  if (typeof window === "undefined") return false
  const nav = navigator as any
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return true
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true
  if (window.innerWidth < 768) return true
  return false
}

export function GalaxyBackground({ scrollY = 0 }: { scrollY?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const animRef = useRef<number>(0)
  const liteMode = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    liteMode.current = isLowEnd()
    const lite = liteMode.current

    let W = 0, H = 0

    function resize() {
      if (!canvas) return
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      initStars()
    }

    function initStars() {
      const count = lite ? 300 : 900
      const stars: Star[] = []

      // Core galaxy cluster — bright dense center
      const coreCount = lite ? 80 : 250
      for (let i = 0; i < coreCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.pow(Math.random(), 1.5) * (W * 0.22)
        const cx = W * 0.5 + Math.cos(angle) * radius * 1.6
        const cy = H * 0.38 + Math.sin(angle) * radius * 0.55
        stars.push({
          x: cx, y: cy, z: Math.random(),
          size: Math.random() * 1.8 + 0.3,
          brightness: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          type: "core",
        })
      }

      // Spiral arm stars
      const armCount = lite ? 120 : 400
      for (let i = 0; i < armCount; i++) {
        const arm = Math.floor(Math.random() * 2)
        const t = Math.pow(Math.random(), 0.7)
        const angle = t * Math.PI * 3 + arm * Math.PI + (Math.random() - 0.5) * 0.8
        const radius = t * W * 0.45
        const cx = W * 0.5 + Math.cos(angle) * radius
        const cy = H * 0.38 + Math.sin(angle) * radius * 0.4
        stars.push({
          x: cx, y: cy, z: Math.random(),
          size: Math.random() * 1.4 + 0.2,
          brightness: Math.random() * 0.5 + 0.15,
          twinkleSpeed: Math.random() * 0.015 + 0.003,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          type: "star",
        })
      }

      // Background stars — fill entire canvas
      const bgCount = lite ? 100 : 250
      for (let i = 0; i < bgCount; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: Math.random() * 0.5,
          size: Math.random() * 0.9 + 0.1,
          brightness: Math.random() * 0.35 + 0.05,
          twinkleSpeed: Math.random() * 0.01 + 0.002,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          type: "star",
        })
      }

      starsRef.current = stars

      // Init shooting stars pool
      shootingStarsRef.current = Array.from({ length: 5 }, () => ({
        x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 0, active: false,
      }))
    }

    let lastShot = 0
    const SHOT_INTERVAL = lite ? 99999 : (5000 + Math.random() * 3000)

    function spawnShootingStar(now: number) {
      if (now - lastShot < SHOT_INTERVAL) return
      const pool = shootingStarsRef.current
      const slot = pool.find(s => !s.active)
      if (!slot) return
      lastShot = now
      const startX = Math.random() * W * 0.8
      const startY = Math.random() * H * 0.4
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5
      const speed = 8 + Math.random() * 6
      slot.x = startX
      slot.y = startY
      slot.vx = Math.cos(angle) * speed
      slot.vy = Math.sin(angle) * speed
      slot.maxLife = 40 + Math.random() * 30
      slot.life = slot.maxLife
      slot.active = true
    }

    let frame = 0

    function draw(now: number) {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)

      // Nebula glow — galaxy core
      const grd = ctx.createRadialGradient(W * 0.5, H * 0.38, 0, W * 0.5, H * 0.38, W * 0.35)
      grd.addColorStop(0, "rgba(140,100,255,0.13)")
      grd.addColorStop(0.3, "rgba(80,60,200,0.07)")
      grd.addColorStop(0.6, "rgba(30,20,100,0.04)")
      grd.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, W, H)

      // Second nebula arm — cyan tint
      const grd2 = ctx.createRadialGradient(W * 0.65, H * 0.3, 0, W * 0.65, H * 0.3, W * 0.2)
      grd2.addColorStop(0, "rgba(6,182,212,0.06)")
      grd2.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = grd2
      ctx.fillRect(0, 0, W, H)

      frame++
      spawnShootingStar(now)

      // Draw stars
      starsRef.current.forEach(star => {
        const t = frame * star.twinkleSpeed + star.twinkleOffset
        const twinkle = 0.5 + 0.5 * Math.sin(t)
        const alpha = star.brightness * (0.6 + 0.4 * twinkle)

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${star.color},${alpha})`
        ctx.fill()

        // Glow for brighter stars
        if (star.size > 1.2 && star.type === "core") {
          const glowR = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4)
          glowR.addColorStop(0, `rgba(${star.color},${alpha * 0.4})`)
          glowR.addColorStop(1, "rgba(0,0,0,0)")
          ctx.fillStyle = glowR
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw shooting stars
      shootingStarsRef.current.forEach(s => {
        if (!s.active) return
        const progress = 1 - s.life / s.maxLife
        const alpha = Math.sin(progress * Math.PI) * 0.9
        const tailLen = 80 + progress * 40

        const grd = ctx.createLinearGradient(
          s.x - s.vx * tailLen / 8, s.y - s.vy * tailLen / 8,
          s.x, s.y
        )
        grd.addColorStop(0, `rgba(255,255,255,0)`)
        grd.addColorStop(1, `rgba(255,255,255,${alpha})`)

        ctx.beginPath()
        ctx.moveTo(s.x - s.vx * tailLen / 8, s.y - s.vy * tailLen / 8)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grd
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Head glow
        ctx.beginPath()
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()

        s.x += s.vx
        s.y += s.vy
        s.life--
        if (s.life <= 0) s.active = false
      })

      animRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [])

  // Scroll-based opacity — galaxy fades as user scrolls
  const galaxyOpacity = Math.max(0, 1 - scrollY / 600)
  const starsOpacity = Math.min(1, 0.3 + scrollY / 400)

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
    >
      {/* Galaxy canvas — fades as you scroll */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: galaxyOpacity }}
      />
      {/* Brand color nebula — fades IN as you scroll */}
      <div
        className="absolute inset-0"
        style={{
          opacity: starsOpacity * 0.6,
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 20%, rgba(37,99,235,0.06) 0%, transparent 50%)",
            "radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.05) 0%, transparent 50%)",
          ].join(","),
        }}
      />
    </div>
  )
}