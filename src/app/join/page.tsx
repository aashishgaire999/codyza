"use client"

import { ApplySection } from "@/components/landing/apply-section"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"

export default function JoinPage() {
  return (
    <PublicShell>
      <EditorialHero
        num="join"
        title={
          <>
            want in?
            <br />
            <span className="text-black/35">start here.</span>
          </>
        }
        description="Five questions. Roughly three minutes. A real person reads every answer."
      />
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 md:px-8">
        <ApplySection />
      </div>
    </PublicShell>
  )
}
