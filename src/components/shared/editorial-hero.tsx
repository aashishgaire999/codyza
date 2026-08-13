import { cn } from "@/lib/utils"
import { getSiteContentState } from "@/lib/site-content"

export async function EditorialHero({ num, title, description, className, contentKey }: {
  num: string; title: React.ReactNode; description?: string; className?: string; contentKey?: string
}) {
  const pageKey = contentKey || num.split("/")[0].trim().replace(/\s+/g, "-")
  const managed = await getSiteContentState<{ label: string; title: string; description: string }>(pageKey, "hero")
  if (!managed.published) return null
  return (
    <section className={cn("cz-page-hero px-5 sm:px-8 lg:px-10", className)}>
      <div className="mx-auto max-w-[1320px]">
        <p className="cz-micro mb-8">{managed.content.label || num}</p>
        <h1 className="cz-display max-w-4xl">{managed.content.title || (managed.content as { headline?: string }).headline || title}</h1>
        {(managed.content.description || (managed.content as { copy?: string }).copy || description) && <p className="cz-body mt-7 max-w-xl">{managed.content.description || (managed.content as { copy?: string }).copy || description}</p>}
      </div>
    </section>
  )
}
