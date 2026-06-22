"use client"

/** Synthwave-style perspective grid floor — matches landing mockup. */
export function PerspectiveGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] overflow-hidden">
      <div className="perspective-grid-floor" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
    </div>
  )
}
