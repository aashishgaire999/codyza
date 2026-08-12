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

export default function HomePage() {
  return (
    <SmoothScroll>
      <main className="cz-landing min-h-screen overflow-x-clip">
        <HomeAuthRedirect />
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
