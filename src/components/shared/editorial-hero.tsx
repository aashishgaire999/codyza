import { cn } from "@/lib/utils"

export function EditorialHero({ num, title, description, className }: {
  num: string; title: React.ReactNode; description?: string; className?: string
}) {
  return (
    <div className={cn("journal-hero mx-auto max-w-[1600px] px-4 py-16 sm:px-6 md:px-8 md:py-20", className)}>
      <p className="sofi-micro mb-6">{num}</p>
      <h1 className="sofi-display-section max-w-4xl text-black">{title}</h1>
      {description && <p className="sofi-body mt-6 max-w-xl">{description}</p>}
    </div>
  )
}
