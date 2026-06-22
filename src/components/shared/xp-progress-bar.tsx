type XpProgressBarProps = {
  current: number
  max: number
  className?: string
}

export function XpProgressBar({ current, max, className }: XpProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        <span>XP Progress</span>
        <span className="text-zinc-400">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] via-[#3b82f6] to-[#06b6d4]"
          style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
        />
      </div>
    </div>
  )
}
