"use client"

import Link from "next/link"
import { FadeInView } from "@/components/effects/fade-in-view"
import { JOIN_HREF } from "@/constants/site"

export function ApplyCta() {
  return (
    <section id="apply" className="cz-join-section cz-border-t px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="cz-join-panel">
          <FadeInView variant="subtle">
            <p className="cz-kicker cz-join-kicker">now onboarding</p>
          </FadeInView>
          <FadeInView variant="headline" delay={100}>
            <h2 className="cz-join-title">
              your next project
              <span>can start with a crew.</span>
            </h2>
          </FadeInView>
          <FadeInView variant="subtle" delay={220}>
            <div className="cz-join-proof">
              <span>3 minute application</span>
              <span>founder reviewed</span>
              <span>free to join</span>
            </div>
          </FadeInView>
          <FadeInView variant="subtle" delay={340}>
            <Link href={JOIN_HREF} className="cz-join-button">start your application</Link>
          </FadeInView>
        </div>
      </div>
    </section>
  )
}
