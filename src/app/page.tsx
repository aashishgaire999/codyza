"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SofiNav } from "@/components/landing/sofi/sofi-nav"
import { SofiScrollProgress } from "@/components/landing/sofi/sofi-scroll"
import { SofiHero } from "@/components/landing/sofi/sofi-hero"
import { SofiChapters } from "@/components/landing/sofi/sofi-chapters"
import { SofiManifesto } from "@/components/landing/sofi/sofi-manifesto"
import { SofiFooter } from "@/components/landing/sofi/sofi-footer"

/**
 * Sofi-exact landing structure:
 * nav → hero → pinned word chapters → manifesto → footer
 */
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
    <main className="sofi-landing min-h-screen">
      <SofiScrollProgress />
      <SofiNav />
      <SofiHero />
      <SofiChapters />
      <SofiManifesto />
      <SofiFooter />
    </main>
  )
}
