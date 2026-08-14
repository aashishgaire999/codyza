import { CodyzaHeroSection } from "@/components/landing/codyza-hero-section"
import { HomeAuthRedirect } from "@/components/landing/home-auth-redirect"
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
import { getSiteContentState } from "@/lib/site-content"
import { SITE_CONFIG, SOCIAL_LINKS } from "@/constants/site"

export default async function HomePage() {
  const heroState = await getSiteContentState<{ headline: string; copy: string; cta: string; cta_href: string }>("home", "hero")
  return (
    <SmoothScroll>
      <main className="cz-landing min-h-screen overflow-x-clip">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${SITE_CONFIG.url}/#website`,
              url: `${SITE_CONFIG.url}/`,
              name: SITE_CONFIG.name,
              alternateName: ["Codyza Community", SITE_CONFIG.domain],
              description: SITE_CONFIG.description,
              publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
            },
            {
              "@type": "Organization",
              "@id": `${SITE_CONFIG.url}/#organization`,
              name: SITE_CONFIG.name,
              url: `${SITE_CONFIG.url}/`,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_CONFIG.url}/logo/codyza-mark-v2.png`,
              },
              description: "A working community for developers, designers, and ambitious builders shipping useful software together.",
              sameAs: [
                SOCIAL_LINKS.linkedin,
                SOCIAL_LINKS.facebook,
                SOCIAL_LINKS.github,
                SOCIAL_LINKS.instagram,
              ],
            },
          ],
        }) }} />
        <HomeAuthRedirect />
        <ScrollProgress />
        <Nav />
        {heroState.published ? <CodyzaHeroSection content={heroState.content} /> : null}
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
