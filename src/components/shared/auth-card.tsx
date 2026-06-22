import { CodyzaLogo } from "@/components/shared/codyza-logo"

type AuthCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="glass-panel relative z-10 w-full max-w-md p-8">
      <div className="mb-6 text-center">
        <CodyzaLogo size={48} withGlow />
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children}
      {footer}
    </div>
  )
}
