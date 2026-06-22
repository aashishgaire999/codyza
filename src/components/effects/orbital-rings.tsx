"use client"

import { cn } from "@/lib/utils"

type OrbitalRingsProps = {
  className?: string
  variant?: "hero" | "subtle"
}

/** Slow-rotating concentric rings — space station horizon accent. */
export function OrbitalRings({ className, variant = "hero" }: OrbitalRingsProps) {
  const isHero = variant === "hero"

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 overflow-hidden",
        isHero ? "bottom-0 h-[60vh]" : "inset-0",
        className
      )}
    >
      <div className="orbital-rings-container">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="orbital-ring"
            style={{
              width: `${40 + i * 18}%`,
              height: `${12 + i * 4}%`,
              animationDuration: `${28 + i * 6}s`,
              animationDirection: i % 2 === 0 ? "reverse" : "normal",
              opacity: isHero ? 0.12 + i * 0.04 : 0.06 + i * 0.02,
            }}
          />
        ))}
      </div>
      {isHero && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
      )}
    </div>
  )
}
