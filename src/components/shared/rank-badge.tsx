import { cn } from "@/lib/utils"

const RANK_TIERS: Record<string, string> = {
  Apprentice: "I",
  "Associate Engineer": "II",
  "Software Engineer": "III",
  "Senior Engineer": "IV",
  "Staff Engineer": "V",
  "Principal Engineer": "VI",
  "Distinguished Engineer": "VII",
  "Codyza Fellow": "VIII",
}

type RankBadgeProps = {
  rank: string
  showTier?: boolean
  className?: string
}

export function RankBadge({ rank, showTier = true, className }: RankBadgeProps) {
  const tier = RANK_TIERS[rank] || "I"
  return (
    <span className={cn("rank-badge", className)}>
      {showTier && (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-[9px] font-bold">
          {tier}
        </span>
      )}
      {rank}
    </span>
  )
}

export function getRankTier(rank: string) {
  return RANK_TIERS[rank] || "I"
}
