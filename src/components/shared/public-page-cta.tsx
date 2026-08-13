import Link from "next/link"
import { FadeInView } from "@/components/effects/fade-in-view"
import { JOIN_HREF } from "@/constants/site"

export function PublicPageCta({
  eyebrow = "join codyza",
  title,
  copy,
  href = JOIN_HREF,
  label = "join the crew",
}: {
  eyebrow?: string
  title: React.ReactNode
  copy?: string
  href?: string
  label?: string
}) {
  return (
    <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="cz-join-panel">
          <FadeInView variant="subtle"><p className="cz-kicker cz-join-kicker">{eyebrow}</p></FadeInView>
          <FadeInView variant="headline" delay={70}><h2 className="cz-join-title">{title}</h2></FadeInView>
          {copy && <FadeInView variant="subtle" delay={150}><p className="cz-join-copy">{copy}</p></FadeInView>}
          <FadeInView variant="subtle" delay={220}><Link href={href} className="cz-join-button">{label}</Link></FadeInView>
        </div>
      </div>
    </section>
  )
}
