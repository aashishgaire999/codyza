"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase"
import { BUILDING_LOCATIONS } from "@/constants/landing"
import { FadeInView } from "@/components/effects/fade-in-view"

const LAUNCH_DATE = new Date("2026-03-15")

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || target <= 0) {
      if (active) setValue(target)
      return
    }
    let start: number | null = null
    let frame = 0
    const step = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration])

  return value
}

function StatItem({
  value,
  label,
  animate = false,
  numericTarget = 0,
  prefix = "",
  inView,
  index,
}: {
  value: string
  label: string
  animate?: boolean
  numericTarget?: number
  prefix?: string
  inView: boolean
  index: number
}) {
  const count = useCountUp(numericTarget, animate && inView)

  return (
    <FadeInView delay={index * 100}>
      <p className="cz-stat-value">{animate ? `${prefix}${count}` : value}</p>
      <p className="cz-micro mt-4">{label}</p>
    </FadeInView>
  )
}

export function StatsBand() {
  const [projectCount, setProjectCount] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  const daysSinceLaunch = Math.max(1, Math.floor((Date.now() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24)))

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { count } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
      setProjectCount(count || 0)
    }
    load()
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const stats = [
    {
      value: `day ${daysSinceLaunch}`,
      label: "since launch",
      animate: true,
      prefix: "day ",
      numericTarget: daysSinceLaunch,
    },
    { value: "open to all", label: "no gatekeeping", animate: false },
    { value: String(projectCount), label: "projects shipping now", animate: true, numericTarget: projectCount },
    { value: "$0", label: "forever — no fees", animate: false },
  ] as const

  return (
    <section ref={sectionRef} className="cz-stats-band relative overflow-hidden cz-border-t">
      <div className="cz-stars-far" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatItem
              key={s.label}
              value={s.value}
              label={s.label}
              animate={"animate" in s ? s.animate : false}
              prefix={"prefix" in s ? s.prefix : ""}
              numericTarget={"numericTarget" in s ? s.numericTarget : 0}
              inView={inView}
              index={i}
            />
          ))}
        </div>

        <FadeInView delay={450}>
          <div className="mt-20 cz-border-t pt-12 md:mt-24">
            <p className="cz-micro text-center">building from</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {BUILDING_LOCATIONS.map((loc) => (
                <span key={loc} className="cz-text-subtle text-[15px] lowercase">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
