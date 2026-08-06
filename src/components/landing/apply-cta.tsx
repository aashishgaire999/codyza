"use client"

import Link from "next/link"
import { SITE_CONFIG } from "@/constants/site"
import { FadeInView } from "@/components/effects/fade-in-view"

export function ApplyCta() {
  return (
    <section id="apply" className="relative overflow-hidden cz-border-t py-20 sm:py-24 md:py-28">
      <div className="cz-stars" aria-hidden />
      <div
        className="cz-apply-glow pointer-events-none absolute left-1/2 top-1/2 h-[70vw] max-h-[720px] w-[70vw] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[100px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <FadeInView variant="subtle">
            <p className="cz-micro">now onboarding</p>
          </FadeInView>
          <FadeInView variant="headline" delay={100}>
            <h2 className="cz-display mt-7 text-[clamp(2.75rem,8vw,6.5rem)]">
              ready to join
              <span className="block cz-headline-muted">the crew?</span>
            </h2>
          </FadeInView>
          <FadeInView variant="subtle" delay={220}>
            <p className="cz-body mx-auto mt-9 max-w-md">
              Applications take ~3 minutes. We review every one within {SITE_CONFIG.reviewCycle}.
            </p>
          </FadeInView>
          <FadeInView variant="subtle" delay={340}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/apply" className="cz-pill cz-pill-solid">
                apply to join
              </Link>
              <Link href="/projects" className="cz-pill">
                see what we&apos;re building
              </Link>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  )
}
