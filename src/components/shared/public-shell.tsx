import { Nav } from "@/components/landing/nav"
import { ScrollProgress } from "@/components/landing/scroll-progress"
import { Footer } from "@/components/landing/footer"
import { cn } from "@/lib/utils"
import { CosmicBackdrop } from "@/components/effects/cosmic-backdrop"

export function PublicShell({ children, className, footer = true }: {
  children: React.ReactNode; className?: string; footer?: boolean
}) {
  return (
    <div className={cn("codyza-public sofi-landing cz-landing min-h-screen overflow-x-clip", className)}>
      <CosmicBackdrop variant="hub" />
      <ScrollProgress />
      <div className="public-cosmic-content relative z-10">
        <Nav />
        <div className="min-h-[calc(100dvh-12rem)] pt-[4.25rem]">{children}</div>
        {footer && <Footer />}
      </div>
    </div>
  )
}
