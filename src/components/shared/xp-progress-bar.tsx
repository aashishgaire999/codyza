type XpProgressBarProps = {
  current: number
  max: number
  className?: string
}

export function XpProgressBar({ current, max, className }: XpProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>XP Progress</span>
        <span>
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="xp-track">
        <div className="xp-track-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
