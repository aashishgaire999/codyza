"use client"

import { ArrowDown } from "lucide-react"
import { ApplySection } from "@/components/landing/apply-section"
import { Nav } from "@/components/landing/nav"
import { Footer } from "@/components/landing/footer"
import { ScrollProgress } from "@/components/landing/scroll-progress"
import { FadeInView } from "@/components/effects/fade-in-view"

const JOIN_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4"

export default function JoinPage() {
  return (
    <main className="codyza-public sofi-landing cz-landing cz-join-page min-h-screen overflow-x-clip">
      <ScrollProgress />
      <Nav />

      <section id="join-top" className="cz-join-hero" aria-labelledby="join-title">
        <video className="cz-join-hero-video" src={JOIN_VIDEO} autoPlay loop muted playsInline aria-hidden />
        <div className="cz-join-hero-blur" aria-hidden />
        <div className="cz-join-hero-content">
          <p className="cz-join-hero-kicker">applications are open</p>
          <h1 id="join-title" className="cz-join-hero-title">
            bring your skills.
            <span>leave with proof.</span>
          </h1>
          <p className="cz-join-hero-copy">Five honest questions. Roughly three minutes. A real person reads every answer.</p>
          <a href="#application" className="cz-join-hero-button">start your application <ArrowDown aria-hidden /></a>
        </div>
        <div className="cz-join-hero-foot">
          <span>free to join</span><span>founder reviewed</span><span>built for people who ship</span>
        </div>
      </section>

      <section id="application" className="cz-section scroll-mt-16 px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <FadeInView variant="headline">
            <div className="mb-12 grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
              <p className="cz-micro">the application</p>
              <div><h2 className="cz-display">tell us what you want to build.</h2><p className="cz-body mt-6 max-w-lg">We care more about intent, curiosity, and follow-through than polished credentials.</p></div>
            </div>
          </FadeInView>
          <div className="cz-application-surface"><ApplySection /></div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
