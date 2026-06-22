"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { TerminalAnimation } from "@/components/effects/terminal-animation"

export function SofiHero() {
  return (
    <section className="relative min-h-screen pt-14">
      <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1600px] grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
        {/* Left — text */}
        <div className="flex flex-col justify-end px-4 pb-12 pt-24 sm:px-6 md:px-8 md:pb-16 lg:pr-8">
          <p className="sofi-micro mb-8">
            ©{new Date().getFullYear()} / 001
          </p>
          <h1 className="sofi-display text-black">
            build
            <br />
            less
            <br />
            <span className="text-black/35">alone.</span>
          </h1>
          <p className="sofi-body mt-8 max-w-md">
            Codyza is a community of devs, designers, and dreamers shipping real projects together.
            Not a bootcamp. Not another chat server. Free to join, built to last.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/apply" className="sofi-pill sofi-pill-fill gap-2">
              apply to join
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/projects" className="sofi-pill border-black/20 text-black/70">
              see projects
            </Link>
          </div>
          <p className="sofi-micro mt-12 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5e7359]" />
            now onboarding founding contributors
          </p>
        </div>

        {/* Right — terminal bleeds off edge */}
        <div className="relative flex items-end overflow-visible px-4 pb-8 sm:px-6 lg:px-0 lg:pl-0">
          <div className="relative w-[120%] max-w-none translate-x-4 lg:w-[130%] lg:translate-x-8">
            <TerminalAnimation />
          </div>
        </div>
      </div>
    </section>
  )
}
