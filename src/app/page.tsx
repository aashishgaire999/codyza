"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CodyzaHeroSection } from "@/components/landing/codyza-hero-section"
import { PressRibbon } from "@/components/landing/press-ribbon"
import { SmoothScroll } from "@/components/providers/smooth-scroll"
import { ScrollProgress } from "@/components/landing/scroll-progress"
import { Nav } from "@/components/landing/nav"
import { Chapters } from "@/components/landing/chapters"
import { About } from "@/components/landing/about"
import { Projects } from "@/components/landing/projects"
import { Team } from "@/components/landing/team"
import { ApplyCta } from "@/components/landing/apply-cta"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash
    if (hash?.includes("access_token=") && (hash.includes("type=invite") || hash.includes("type=recovery"))) {
      router.replace(`/set-password${hash}`)
    }
  }, [router])

  return (
    <SmoothScroll>
      <main className="cz-landing min-h-screen overflow-x-clip">
        <ScrollProgress />
        <Nav />
        <CodyzaHeroSection />
        <PressRibbon />
        <About />
        <Projects />
        <Chapters />
        <Team />
        <ApplyCta />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
