import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"

export const metadata: Metadata = { title: "Verify a certificate", description: "Verify a Codyza credential by its certificate code." }

export default function VerifyCertificatePage() {
  return (
    <PublicShell>
      <EditorialHero num="trust / certificate verification" title={<>proof should be <span className="cz-headline-muted">easy to verify.</span></>} description="Codyza credentials are checked by exact certificate code—never through a public certificate directory." />
      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[720px] cz-card p-7 sm:p-10">
          <span className="cz-person-card-avatar"><ShieldCheck aria-hidden /></span>
          <h2 className="cz-display mt-8 !text-[clamp(2.25rem,6vw,4.5rem)]">verification is being connected.</h2>
          <p className="cz-body mt-6">The page is ready, but public lookup remains closed until Codyza’s certificate table and non-sequential code format are confirmed. We will not pretend a code was checked when it was not.</p>
          <p className="cz-body mt-4">For a manual verification, email the certificate code to <a href="mailto:team@codyza.com" className="cz-inline-link">team@codyza.com</a>.</p>
          <Link href="/quest" className="cz-pill mt-8">how Codyza credentials work</Link>
        </div>
      </section>
    </PublicShell>
  )
}
