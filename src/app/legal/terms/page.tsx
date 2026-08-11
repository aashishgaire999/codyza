import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"

export const metadata: Metadata = { title: "Terms", description: "The terms for using Codyza and participating in the community." }

export default function TermsPage() {
  return (
    <PublicShell>
      <EditorialHero num="trust / terms" title={<>clear expectations make <span className="cz-headline-muted">better work.</span></>} description="The basic agreement for using Codyza and participating in the crew." />
      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10"><div className="cz-static-copy mx-auto max-w-[900px]">
        <p className="cz-micro">last updated / august 7, 2026</p>
        <h2>Use Codyza respectfully</h2><p>Do not misuse the service, interfere with other members, attempt unauthorized access, impersonate someone else, or submit unlawful or harmful material.</p>
        <h2>Your work and attribution</h2><p>You keep ownership of work you create unless a separate project agreement says otherwise. By submitting approved work for public display, you allow Codyza to show the project and your attributed contribution on its public pages.</p>
        <h2>Community participation</h2><p>Membership is voluntary and free. Access to private workspaces may be limited, suspended, or removed when conduct harms the crew, its projects, or its members.</p>
        <h2>No guaranteed outcome</h2><p>Codyza provides a collaborative environment, not guaranteed employment, payment, certification, placement, or project success. Public proof reflects approved participation; it is not a professional license.</p>
        <h2>Changes and contact</h2><p>These terms may evolve as Codyza grows. Material updates will be recorded publicly. Questions can be sent to <a className="cz-inline-link" href="mailto:team@codyza.com">team@codyza.com</a>.</p>
        <Link href="/" className="cz-inline-link mt-12">home</Link>
      </div></section>
    </PublicShell>
  )
}
