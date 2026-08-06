"use client"

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react"

type FadeInVariant = "default" | "headline" | "subtle"

const VARIANTS: Record<FadeInVariant, { from: string; duration: string; easing: string }> = {
  headline: {
    from: "translateY(56px)",
    duration: "0.95s",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  default: {
    from: "translateY(36px)",
    duration: "0.8s",
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  subtle: {
    from: "translateY(18px)",
    duration: "0.7s",
    easing: "cubic-bezier(0.25, 1, 0.4, 1)",
  },
}

export function FadeInView({
  children,
  delay = 0,
  className = "",
  variant = "default",
  style,
}: {
  children: ReactNode
  delay?: number
  className?: string
  variant?: FadeInVariant
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { from, duration, easing } = VARIANTS[variant]

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1"
      el.style.transform = "none"
      return
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1"
            el.style.transform = "translateY(0)"
          }, delay)
          obs.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [delay, from])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: from,
        transition: `opacity ${duration} ${easing}, transform ${duration} ${easing}`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
