import { XpProgressBar } from "@/components/shared/xp-progress-bar"

type CzxIdCardProps = {
  id?: string
  name?: string
  rank?: string
  xp?: number
  xpMax?: number
  joined?: string
  showXpBar?: boolean
}

export function CzxIdCard({
  id = "0042",
  name = "Sample Member",
  rank = "Software Engineer",
  xp = 2140,
  xpMax = 3500,
  joined = "Mar 2026",
  showXpBar = true,
}: CzxIdCardProps) {
  return (
    <div className="id-card-glow w-full max-w-[320px]">
      <div className="id-card-inner">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563eb] to-[#7c3aed] font-mono text-xs font-bold text-white">
              CZX
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="text-xs text-zinc-500">{rank}</div>
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
            <div className="mt-0.5 font-medium text-zinc-300">{rank}</div>
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
