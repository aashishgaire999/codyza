"use client"

import { Sparkles } from "lucide-react"
import { SectionBadge } from "@/components/shared/section-badge"
import { CzxIdCard } from "@/components/shared/czx-id-card"
import { SITE_CONFIG } from "@/constants/site"

export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-32 px-6 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <span className="landing-section-num mb-8 block">002</span>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-6">
            <SectionBadge icon={<Sparkles className="h-3 w-3 text-accent" />}>
              What Is Codyza
            </SectionBadge>
            <h2 className="font-[family-name:var(--font-fraunces)] text-[clamp(1.75rem,4.5vw,3rem)] font-light leading-snug lowercase">
              you don&apos;t need another course.
              <br />
              you need a <span className="italic text-accent">crew.</span>
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {SITE_CONFIG.description}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <CzxIdCard />
          </div>
        </div>
      </div>
    </section>
  )
}
