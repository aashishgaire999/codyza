import type { Metadata } from "next"
import Link from "next/link"
import { PublicShell } from "@/components/shared/public-shell"
import { EditorialHero } from "@/components/shared/editorial-hero"
import { PublicPageCta } from "@/components/shared/public-page-cta"
import { getNewsEntries } from "@/lib/news"

export const metadata: Metadata = {
  title: "News",
  description: "Launches, updates, and announcements from the Codyza crew.",
}

export default async function NewsPage() {
  const entries = await getNewsEntries()
  return (
    <PublicShell>
      <EditorialHero num="news / the build log" title={<>progress deserves <span className="cz-headline-muted">a public record.</span></>} description="Launches, operating updates, and the moments that move Codyza forward." />
      <section className="cz-section cz-border-t px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          {entries.length === 0 ? (
            <div className="cz-project-empty">
              <div><p className="cz-micro">an honest beginning</p><p className="cz-project-empty-title">The first public update is still being written.</p></div>
              <div><p className="cz-body max-w-md">This feed opens when there is a real launch, update, or announcement worth recording.</p><Link href="/projects" className="cz-inline-link mt-6">see the work in progress</Link></div>
            </div>
          ) : (
            <div className="cz-news-feed">
              {entries.map((entry) => (
                <Link key={entry.slug} href={`/news/${entry.slug}`} className="cz-news-row">
                  <time dateTime={entry.date}>{new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                  <div><span className="cz-micro">{entry.tag}</span><h2 className="mt-3">{entry.title}</h2><p>{entry.summary}</p></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <PublicPageCta title={<>the next update <span>could carry your name.</span></>} copy="Join the crew and help turn the next idea into something public." />
    </PublicShell>
  )
}
