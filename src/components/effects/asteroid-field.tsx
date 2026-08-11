"use client"

import { useEffect, useRef } from "react"

interface Asteroid {
  x: number
  y: number
  z: number
  size: number
  rotation: number
  rotSpeed: number
  vx: number
  vy: number
  vertices: number[]
  shade: number
}

function isLowEnd(): boolean {
  if (typeof window === "undefined") return false
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return true
  if (nav.deviceMemory && nav.deviceMemory <= 2) return true
  return window.innerWidth < 768
}

function buildVertices(segments: number, wobble: number): number[] {
  const verts: number[] = []
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const r = 0.65 + Math.random() * wobble
    verts.push(Math.cos(angle) * r, Math.sin(angle) * r)
  }
  return verts
}

export function AsteroidField({
  density = "normal",
  scrollY = 0,
}: {
  density?: "light" | "normal" | "heavy"
  scrollY?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const asteroidsRef = useRef<Asteroid[]>([])
  const animRef = useRef<number>(0)
  const liteRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    liteRef.current = isLowEnd()
    const lite = liteRef.current

    let W = 0
    let H = 0

    const countMap = { light: lite ? 6 : 12, normal: lite ? 10 : 22, heavy: lite ? 14 : 32 }
    const count = countMap[density]

    function resize() {
      if (!canvas) return
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      initAsteroids()
    }

    function initAsteroids() {
      asteroidsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random() * 0.8 + 0.2,
        size: (Math.random() * 18 + 8) * (lite ? 0.7 : 1),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.1 + 0.04,
        vertices: buildVertices(6 + Math.floor(Math.random() * 4), 0.35),
        shade: Math.random() * 0.25 + 0.12,
      }))
    }

    function drawAsteroid(a: Asteroid) {
      if (!ctx) return
      const parallax = 0.3 + a.z * 0.7
      const alpha = a.shade * parallax
      const s = a.size * parallax

      ctx.save()
      ctx.translate(a.x, a.y)
      ctx.rotate(a.rotation)

      ctx.beginPath()
      const v = a.vertices
      ctx.moveTo(v[0] * s, v[1] * s)
      for (let i = 2; i < v.length; i += 2) {
        ctx.lineTo(v[i] * s, v[i + 1] * s)
      }
      ctx.closePath()

      const grd = ctx.createRadialGradient(-s * 0.2, -s * 0.2, 0, 0, 0, s)
      grd.addColorStop(0, `rgba(120,115,140,${alpha * 1.4})`)
      grd.addColorStop(0.6, `rgba(70,68,90,${alpha})`)
      grd.addColorStop(1, `rgba(40,38,55,${alpha * 0.6})`)
      ctx.fillStyle = grd
      ctx.fill()

      ctx.strokeStyle = `rgba(167,139,250,${alpha * 0.15})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.restore()
    }

    function frame() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, W, H)

      asteroidsRef.current.forEach((a) => {
        a.x += a.vx * a.z
        a.y += a.vy * a.z
        a.rotation += a.rotSpeed

        if (a.x < -60) a.x = W + 60
        if (a.x > W + 60) a.x = -60
        if (a.y < -60) a.y = H + 60
        if (a.y > H + 60) a.y = -60

        drawAsteroid(a)
      })

      animRef.current = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener("resize", resize)
    animRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [density])

  const parallaxShift = scrollY * 0.08

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{
        zIndex: 0,
        opacity: Math.max(0.35, 1 - scrollY / 900),
        transform: `translateY(${parallaxShift}px)`,
      }}
    />
  )
}
