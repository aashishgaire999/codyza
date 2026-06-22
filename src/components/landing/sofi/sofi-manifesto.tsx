"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { SITE_CONFIG } from "@/constants/site"
import { FOUNDING_TEAM } from "@/constants/team"
import { APPLY_ROADMAP } from "@/constants/landing"
import { CzxIdCard } from "@/components/shared/czx-id-card"

export function SofiManifesto() {
  const [liveCount, setLiveCount] = useState(0)
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ count: live }, { count: members }] = await Promise.all([
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("contributors").select("*", { count: "exact", head: true }),
      ])
      setLiveCount(live || 0)
      setMemberCount(members || 0)
    }
    load()
  }, [])

  return (
    <section id="about" className="scroll-mt-24 px-4 py-24 sm:px-6 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1600px]">
        <p className="sofi-micro mb-12">005 / manifesto</p>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24">
          <div>
            <p className="sofi-headline-section max-w-4xl text-black">
              you don&apos;t need another course. you need a crew.
            </p>
            <p className="sofi-body mt-8 max-w-xl">{SITE_CONFIG.description}</p>

            <div className="mt-16 grid grid-cols-3 gap-6 border-t border-black/10 pt-10">
              <div>
                <p className="sofi-display-section text-black">{liveCount}</p>
                <p className="sofi-micro mt-2">live projects</p>
              </div>
              <div>
                <p className="sofi-headline-section text-black">{memberCount}</p>
                <p className="sofi-micro mt-2">members</p>
              </div>
              <div>
                <p className="sofi-headline-section text-black">$0</p>
                <p className="sofi-micro mt-2">fees ever</p>
              </div>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              {APPLY_ROADMAP.map((step) => (
                <div key={step.num} className="border-t border-black/10 pt-4">
                  <p className="sofi-micro">{step.num}</p>
                  <p className="mt-2 text-[15px] font-medium lowercase text-black">{step.title}</p>
                  <p className="sofi-body mt-1 text-[13px]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-10 lg:items-end">
            <CzxIdCard />
            <div className="w-full max-w-sm">
              <p className="sofi-micro mb-4">founding team</p>
              <ul className="space-y-3">
                {FOUNDING_TEAM.map((m) => (
                  <li key={m.name} className="flex items-baseline justify-between gap-4 border-b border-black/6 pb-3">
                    <span className="text-[15px] lowercase text-black">{m.name}</span>
                    <span className="sofi-micro">{m.role.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div id="apply" className="mt-24 border-t border-black/10 pt-16 text-center">
          <p className="sofi-body mx-auto max-w-md">
            Applications take ~3 minutes. We review every one within {SITE_CONFIG.reviewCycle}.
          </p>
          <Link href="/apply" className="sofi-pill sofi-pill-fill mt-8">
            apply to join
          </Link>
        </div>
      </div>
    </section>
  )
}
