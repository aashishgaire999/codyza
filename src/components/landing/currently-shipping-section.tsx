"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { ExternalLink, Calendar, Users, Rocket, CircleDollarSign, Sparkles } from "lucide-react"
import { SectionBadge } from "@/components/shared/section-badge"
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/fade-in"

interface Submission {
  id: string
  codyza_id: string
  project_name: string
  live_url: string | null
  status: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  approved: { label: "live", color: "var(--success)" },
  pending: { label: "in review", color: "#d4a054" },
  reviewed: { label: "building", color: "var(--accent)" },
}

export function CurrentlyShippingSection() {
  const [cards, setCards] = useState<Submission[]>([])
  const [contribMap, setContribMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: subs }, { data: contribs }] = await Promise.all([
        supabase.from("submissions").select("id, codyza_id, project_name, live_url, status").in("status", ["approved", "pending", "reviewed"]).order("submitted_at", { ascending: false }).limit(3),
        supabase.from("contributors").select("codyza_id, name"),
      ])
      setCards(subs || [])
      setContribMap(new Map((contribs || []).map((c: { codyza_id: string; name: string }) => [c.codyza_id, c.name])))
      setLoading(false)
    }
    load()
  }, [])

  const placeholders = Math.max(0, 3 - cards.length)

  return (
    <section className="px-6 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <span className="landing-section-num mb-8 block">003</span>
        <div className="mb-12 flex items-center gap-3">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <SectionBadge live>Currently Shipping</SectionBadge>
        </div>

        <StaggerChildren className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { value: "Day 14", label: "building in public", icon: Calendar },
            { value: "Open", label: "developers & designers", icon: Users },
            { value: String(cards.length || "—"), label: "actively being built", icon: Rocket },
            { value: "$0", label: "no fees. ever.", icon: CircleDollarSign },
          ].map(({ value, label, icon: Icon }) => (
            <StaggerItem key={label}>
              <div className="surface-card p-5 md:p-6">
                <Icon className="mb-3 h-5 w-5 text-accent" />
                <div className="font-[family-name:var(--font-heading)] text-xl font-bold lowercase md:text-2xl">{value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => {
            const status = STATUS_CONFIG[card.status] || STATUS_CONFIG.reviewed
            return (
              <FadeIn key={card.id}>
                <div className="surface-card p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: status.color }}>
                      {status.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{card.codyza_id}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold lowercase">{card.project_name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{contribMap.get(card.codyza_id) || "contributor"}</p>
                  {card.live_url && (
                    <a href={card.live_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:opacity-80">
                      View live <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </FadeIn>
            )
          })}
          {!loading && Array.from({ length: placeholders }).map((_, i) => (
            <div key={`ph-${i}`} className="surface-card border-dashed p-6 opacity-60">
              <p className="text-sm text-muted-foreground">+ your project here</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
