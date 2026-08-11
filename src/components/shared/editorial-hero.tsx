import { cn } from "@/lib/utils"
import { getSiteContent } from "@/lib/site-content"

export async function EditorialHero({ num, title, description, className, contentKey }: {
  num: string; title: React.ReactNode; description?: string; className?: string; contentKey?: string
}) {
  const pageKey = contentKey || num.split("/")[0].trim().replace(/\s+/g, "-")
  const managed = await getSiteContent<{ label: string; title: string; description: string }>(pageKey, "hero")
  return (
    <section className={cn("cz-page-hero px-5 sm:px-8 lg:px-10", className)}>
      <div className="mx-auto max-w-[1320px]">
        <p className="cz-micro mb-8">{managed.label || num}</p>
        <h1 className="cz-display max-w-4xl">{managed.title || title}</h1>
        {(managed.description || description) && <p className="cz-body mt-7 max-w-xl">{managed.description || description}</p>}
      </div>
    </section>
  )
}
