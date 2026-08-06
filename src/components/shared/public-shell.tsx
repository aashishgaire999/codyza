import { SofiNav } from "@/components/landing/sofi/sofi-nav"
import { SofiScrollProgress } from "@/components/landing/sofi/sofi-scroll"
import { SofiFooter } from "@/components/landing/sofi/sofi-footer"
import { cn } from "@/lib/utils"

export function PublicShell({ children, className, footer = true }: {
  children: React.ReactNode; className?: string; footer?: boolean
}) {
  return (
    <div className={cn("codyza-public sofi-landing min-h-screen overflow-x-clip", className)}>
      <SofiScrollProgress />
      <SofiNav />
      <div className="min-h-[calc(100vh-12rem)] pt-16">{children}</div>
      {footer && <SofiFooter />}
    </div>
  )
}
