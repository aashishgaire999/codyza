import { XpProgressBar } from "@/components/shared/xp-progress-bar"

type CzxIdCardProps = {
  id?: string
  name?: string
  rank?: string
  xp?: number
  xpMax?: number
  joined?: string
  showXpBar?: boolean
  variant?: "dark" | "journal"
}

export function CzxIdCard({
  id = "0042",
  name = "maya k.",
  rank = "Associate Engineer",
  xp = 840,
  xpMax = 1500,
  joined = "Jan 2026",
  showXpBar = true,
  variant = "journal",
}: CzxIdCardProps) {
  if (variant === "journal") {
    return (
      <div className="journal-id-card">
        <p className="journal-label mb-3">example member card</p>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-medium lowercase text-black">{name}</p>
            <p className="sofi-micro mt-0.5">{rank.toLowerCase()}</p>
          </div>
          <span className="rounded-full border border-[var(--journal-sage)]/30 bg-[var(--journal-sage)]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--journal-sage)]">
            active
          </span>
        </div>
        <div className="my-5 border-t border-black/8 pt-4">
          <p className="sofi-micro">member id</p>
          <p className="id-num mt-1">
            CZX-<span>{id}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="sofi-micro">joined</p>
            <p className="mt-0.5 text-[13px] text-black/80">{joined}</p>
          </div>
          <div>
            <p className="sofi-micro">xp</p>
            <p className="mt-0.5 text-[13px] text-black/80">{xp.toLocaleString()}</p>
          </div>
        </div>
        {showXpBar && (
          <div className="mt-5 border-t border-black/8 pt-4">
            <XpProgressBar current={xp} max={xpMax} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="id-card-glow w-full max-w-[320px]">
      <div className="id-card-inner">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#1b14ba] to-[#302bfb] font-mono text-xs font-bold text-white">
              CZX
            </div>
            <div>
              <div className="lowercase text-sm font-semibold text-white">{name}</div>
              <div className="lowercase text-xs text-zinc-500">{rank}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-[#22c55e]">Active</span>
          </div>
        </div>

        <div className="my-5 border-t border-white/[0.06] pt-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Member ID</div>
          <div className="mt-1 font-mono text-2xl font-bold tracking-wider text-white">
            CZX-<span className="text-gradient-codyza">{id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Joined</div>
            <div className="mt-0.5 font-medium text-zinc-300">{joined}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Rank</div>
            <div className="lowercase mt-0.5 font-medium text-zinc-300">{rank}</div>
          </div>
        </div>

        {showXpBar && (
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <XpProgressBar current={xp} max={xpMax} />
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)" }}
        />
      </div>
    </div>
  )
}
