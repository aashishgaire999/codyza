type MemberPageHeaderProps = {
  label: string
  title: React.ReactNode
  description?: string
}

export function MemberPageHeader({ label, title, description }: MemberPageHeaderProps) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="member-hero-label mb-4">{label}</p>
      <h1 className="member-headline text-foreground">{title}</h1>
      {description && <p className="mt-4 text-muted-foreground">{description}</p>}
    </div>
  )
}
