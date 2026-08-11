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
    const checkPosition = () => {
      const element = elementRef.current
      if (!element) return

      // Checking the element's top instead of relying only on IntersectionObserver
      // means a fast scroll cannot skip the reveal and leave a blank section behind.
      if (element.getBoundingClientRect().top <= window.innerHeight * 0.94) {
        setVisible(true)
      }
    }

    checkPosition()
    window.addEventListener("scroll", checkPosition, { passive: true })
    window.addEventListener("resize", checkPosition)

    return () => {
      window.removeEventListener("scroll", checkPosition)
      window.removeEventListener("resize", checkPosition)
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
