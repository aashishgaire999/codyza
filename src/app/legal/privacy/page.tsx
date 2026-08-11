import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"

export const metadata: Metadata = { title: "Privacy", description: "How Codyza collects, uses, and protects personal information." }

export default function PrivacyPage() {
  return (
    <PublicShell>
      <EditorialHero num="trust / privacy" title={<>your work can be public. <span className="cz-headline-muted">your private data is not.</span></>} description="A plain-language account of what Codyza collects and why." />
      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10"><div className="cz-static-copy mx-auto max-w-[900px]">
        <p className="cz-micro">last updated / august 7, 2026</p>
        <h2>What we collect</h2><p>Application details include your name, email, GitHub username, skills, experience level, preferred role, and written answers. Accepted contributors may also provide a profile photo, biography, links, skills, project submissions, and work-session summaries.</p>
        <h2>What becomes public</h2><p>Public contributor profiles may show your name, Codyza ID, role, biography, skills, rank, XP, streak, avatar, approved projects, and links you intentionally provide. Email addresses, application answers, admin status, internal review notes, pending work, and rejected submissions are not public.</p>
        <h2>How we use information</h2><p>We use this information to review applications, operate the contributor community, attribute approved work, maintain progress records, communicate with members, and protect the service.</p>
        <h2>Analytics</h2><p>Codyza uses cookieless Vercel Analytics and lightweight product events to understand page performance and application flow. Analytics events do not include email addresses or application answers.</p>
        <h2>Your choices</h2><p>Contributors may request that their public profile be hidden or corrected. For access, correction, or deletion requests, email <a className="cz-inline-link" href="mailto:team@codyza.com">team@codyza.com</a>.</p>
        <Link href="/" className="cz-inline-link mt-12">home</Link>
      </div></section>
    </PublicShell>
  )
}
