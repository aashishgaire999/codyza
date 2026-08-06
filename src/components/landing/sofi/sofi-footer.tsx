"use client"

import Link from "next/link"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { SlackGateButton } from "@/components/landing/slack-gate-button"
import { FadeInView } from "@/components/effects/fade-in-view"

export function SofiFooter() {
  return (
    <footer data-sofi-theme="light" className="border-t border-black/10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 md:px-8">
        <FadeInView delay={0} variant="headline">
          <div className="grid gap-12 py-14 md:grid-cols-2 md:py-16">
            <div>
              <p className="sofi-footer-logo text-black">codyza</p>
              <p className="sofi-micro mt-2">build in public · grow as a team · ship without fear</p>
            </div>

            <div>
              <p className="sofi-micro mb-4">explore</p>
              <nav className="flex flex-col gap-2.5">
                <Link href="/#about" className="sofi-body text-[13px] text-black/60 hover:text-black">about</Link>
                <Link href="/apply" className="sofi-body text-[13px] text-black/60 hover:text-black">apply</Link>
                <Link href="/projects" className="sofi-body text-[13px] text-black/60 hover:text-black">projects</Link>
                <Link href="/leaderboard" className="sofi-body text-[13px] text-black/60 hover:text-black">leaderboard</Link>
                <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="sofi-body text-[13px] text-black/60 hover:text-black">github</a>
                <a href={`mailto:${SITE_CONFIG.email}`} className="sofi-body text-[13px] text-black/60 hover:text-black">contact</a>
                <SlackGateButton mode="text" />
              </nav>
            </div>
          </div>
        </FadeInView>

        <p className="sofi-micro border-t border-black/10 py-6 text-black/30">
          © {new Date().getFullYear()} {SITE_CONFIG.name.toLowerCase()} · {SITE_CONFIG.tagline.toLowerCase()}
        </p>
      </div>
    </footer>
  )
}
