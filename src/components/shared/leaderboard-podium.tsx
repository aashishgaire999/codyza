import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

type PodiumContributor = {
  codyza_id: string
  name: string
  xp: number
  avatar_url?: string | null
}

const ORDER = [1, 0, 2] as const

type LeaderboardPodiumProps = {
  contributors: PodiumContributor[]
}

export function LeaderboardPodium({ contributors }: LeaderboardPodiumProps) {
  const top3 = contributors.slice(0, 3)
  if (top3.length === 0) return null

  const slots = ORDER.map((idx) => top3[idx]).filter(Boolean)

  return (
    <div className="podium-grid mx-auto max-w-3xl">
      {slots.map((c) => {
        const position = top3.indexOf(c!) + 1
        const isFirst = position === 1

        return (
          <Link
            key={c!.codyza_id}
            href={`/contributor/${c!.codyza_id.toLowerCase()}`}
            className={cn("podium-slot group block", isFirst && "podium-slot-first md:-mt-4")}
          >
            <p className="sofi-micro mb-3">#{position}</p>
            <div
              className={cn(
                "relative mx-auto mb-3 flex items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#f7f7f7]",
                isFirst ? "h-16 w-16" : "h-12 w-12"
              )}
            >
              {c!.avatar_url ? (
                <Image src={c!.avatar_url} alt={c!.name} fill sizes="64px" className="object-cover" />
              ) : (
                <span className="font-mono text-sm font-bold text-black/60">
                  {c!.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <p className="truncate font-[family-name:var(--font-instrument)] text-lg lowercase text-black group-hover:opacity-70">
              {c!.name}
            </p>
            <p className="sofi-micro mt-1">{c!.codyza_id}</p>
            <p className="podium-rank-num mt-3">{c!.xp.toLocaleString()}</p>
            <p className="sofi-micro mt-1">xp</p>
          </Link>
        )
      })}
    </div>
  )
}
