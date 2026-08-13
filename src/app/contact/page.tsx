import { Camera, Code2, Mail } from "lucide-react"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { SlackGateButton } from "@/components/landing/slack-gate-button"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"
import { publicMetadata } from "@/lib/public-metadata"

export const metadata = publicMetadata("Contact", "Talk to the Codyza crew about partnerships, hiring, or the community.", "/contact")

export default function ContactPage() {
  return (
    <PublicShell>
      <EditorialHero num="contact / talk to a person" title={<>start with a real <span className="cz-headline-muted">conversation.</span></>} description="Questions, partnerships, hiring, or something we have not thought of yet—send it to the right place." />
      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px] cz-people-grid">
          <a href={`mailto:${SITE_CONFIG.email}`} className="cz-person-card"><span className="cz-person-card-avatar"><Mail aria-hidden /></span><h2 className="mt-auto font-[family-name:var(--font-instrument)] text-3xl lowercase">general questions</h2><p className="cz-person-card-meta">{SITE_CONFIG.email}</p></a>
          <a href={`mailto:${SITE_CONFIG.hrEmail}`} className="cz-person-card"><span className="cz-person-card-avatar"><Mail aria-hidden /></span><h2 className="mt-auto font-[family-name:var(--font-instrument)] text-3xl lowercase">hiring and talent</h2><p className="cz-person-card-meta">{SITE_CONFIG.hrEmail}</p></a>
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="cz-person-card"><span className="cz-person-card-avatar"><Code2 aria-hidden /></span><h2 className="mt-auto font-[family-name:var(--font-instrument)] text-3xl lowercase">follow the code</h2><p className="cz-person-card-meta">github / codyza-com</p></a>
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="cz-person-card"><span className="cz-person-card-avatar"><Camera aria-hidden /></span><h2 className="mt-auto font-[family-name:var(--font-instrument)] text-3xl lowercase">follow the story</h2><p className="cz-person-card-meta">instagram / codyza_</p></a>
          <div className="cz-person-card"><span className="cz-person-card-avatar">S</span><h2 className="mt-auto font-[family-name:var(--font-instrument)] text-3xl lowercase">member slack</h2><p className="cz-person-card-meta"><SlackGateButton mode="text" /></p></div>
        </div>
      </section>
    </PublicShell>
  )
}
