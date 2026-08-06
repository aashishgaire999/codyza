import Link from "next/link"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type QuestCardProps = {
  title: string
  techTags?: string[]
  xpReward: number
  status?: string
  href?: string
  action?: React.ReactNode
  className?: string
}

export function QuestCard({
  title,
  techTags = [],
  xpReward,
  status,
  href,
  action,
  className,
}: QuestCardProps) {
  const inner = (
    <>
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {status && (
          <span className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {status}
          </span>
        )}
      </div>
      {techTags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {techTags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="quest-card-xp">
          <Zap className="h-3 w-3" />+{xpReward} xp
        </span>
        {action}
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn("quest-card block", className)}>
        {inner}
      </Link>
    )
  }

  return <div className={cn("quest-card", className)}>{inner}</div>
}
