"use client"

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"
import { motion, useReducedMotion } from "framer-motion"

type FadeInVariant = "default" | "headline" | "subtle"

const VARIANTS: Record<FadeInVariant, { distance: number; duration: number }> = {
  headline: {
    distance: 28,
    duration: 0.7,
  },
  default: {
    distance: 20,
    duration: 0.58,
  },
  subtle: {
    distance: 10,
    duration: 0.42,
  },
}

const revealCallbacks = new WeakMap<Element, () => void>()
let revealObserver: IntersectionObserver | null = null

function getRevealObserver() {
  if (revealObserver) return revealObserver

  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        revealCallbacks.get(entry.target)?.()
        revealCallbacks.delete(entry.target)
        revealObserver?.unobserve(entry.target)
      }
    },
    {
      rootMargin: "0px 0px -6% 0px",
      threshold: 0.01,
    },
  )

  return revealObserver
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
  const elementRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()
  const { distance, duration } = VARIANTS[variant]

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (!("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }

    const observer = getRevealObserver()
    revealCallbacks.set(element, () => setVisible(true))
    observer.observe(element)
    return () => {
      revealCallbacks.delete(element)
      observer.unobserve(element)
    }
  }, [])

  return (
    <motion.div
      ref={elementRef}
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : distance }}
      animate={visible || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{
        duration: reduceMotion ? 0.2 : duration,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      style={style}
    >
      {children}
    </motion.div>
  )
}
