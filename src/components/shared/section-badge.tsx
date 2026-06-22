"use client"

import { cn } from "@/lib/utils"

type SectionBadgeProps = {
  children: React.ReactNode
  className?: string
  live?: boolean
  icon?: React.ReactNode
}

export function SectionBadge({ children, className, live = false, icon }: SectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
        className
      )}
    >
      {live && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
      )}
      {icon}
      {children}
    </div>
  )
}
