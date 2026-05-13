"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlowOrbProps {
  color?: "purple" | "blue" | "cyan" | "green"
  size?: number
  className?: string
  duration?: number
}

const COLOR_MAP = {
  purple: "rgba(139, 92, 246, 0.4)",
  blue: "rgba(59, 130, 246, 0.4)",
  cyan: "rgba(6, 182, 212, 0.4)",
  green: "rgba(34, 197, 94, 0.4)",
}

export function GlowOrb({
  color = "purple",
  size = 600,
  className,
  duration = 12,
}: GlowOrbProps) {
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${COLOR_MAP[color]} 0%, transparent 70%)`,
        filter: "blur(80px)",
      }}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -30, 40, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}