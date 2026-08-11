"use client"

import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { ScrollProgress } from "@/components/motion/scroll-progress"
import { cn } from "@/lib/utils"

type SiteShellProps = {
  children: React.ReactNode
  className?: string
  showProgress?: boolean
}

/** Minimal editorial page shell — Sofi-inspired, no space effects */
export function SiteShell({ children, className, showProgress = true }: SiteShellProps) {
  useScrollReveal()

  return (
    <div className={cn("relative min-h-screen bg-background text-foreground", className)}>
      {showProgress && <ScrollProgress />}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
