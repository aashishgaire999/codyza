"use client"

import Link from "next/link"
import { ApplySection } from "@/components/landing/apply-section"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { SiteShell } from "@/components/shared/site-shell"
import { FadeIn } from "@/components/motion/fade-in"
import { SectionLabel } from "@/components/motion/text-reveal"

export default function ApplyPage() {
  return (
    <SiteShell>
      <Navbar />
      <main className="px-6 pb-20 pt-28 md:px-8">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <SectionLabel num="004" label="apply" />
            <h1 className="headline-section font-[family-name:var(--font-heading)] lowercase">
              ready to <span className="text-accent">build with us?</span>
            </h1>
            <p className="mt-4 text-muted-foreground">Five honest answers. About three minutes. A founder reads every one.</p>
          </FadeIn>
          <div className="mt-12">
            <ApplySection />
          </div>
        </div>
      </main>
      <Footer />
    </SiteShell>
  )
}
