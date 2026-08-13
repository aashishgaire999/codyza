import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PublicShell } from "@/components/shared/public-shell"
import { PublicPageCta } from "@/components/shared/public-page-cta"
import { getNewsEntries, getNewsEntry, newsBodyBlocks } from "@/lib/news"
import { NewsComments } from "@/components/news/news-comments"
import { publicMetadata } from "@/lib/public-metadata"

export async function generateStaticParams() {
  return (await getNewsEntries()).map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const entry = await getNewsEntry(slug)
  return entry ? publicMetadata(entry.title, entry.summary, `/news/${entry.slug}`) : { title: "News" }
}

export default async function NewsEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = await getNewsEntry(slug)
  if (!entry) notFound()

  return (
    <PublicShell>
      <article>
        <header className="cz-page-hero px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-[920px]">
            <Link href="/news" className="cz-inline-link mb-12">news</Link>
            <p className="cz-micro">{entry.tag} / <time dateTime={entry.date}>{entry.date}</time></p>
            <h1 className="cz-display mt-8">{entry.title}</h1>
            <p className="cz-editorial-lede mt-8">{entry.summary}</p>
            {entry.coverImageUrl && <img src={entry.coverImageUrl} alt={entry.coverImageAlt || ""} className="cz-news-cover mt-10" />}
          </div>
        </header>
        <div className="cz-section cz-border-t px-5 sm:px-8 lg:px-10"><div className="cz-static-copy mx-auto max-w-[760px]">{newsBodyBlocks(entry.body).map((block, index) => <p key={`${entry.slug}-${index}`}>{block}</p>)}<NewsComments slug={entry.slug} /></div></div>
      </article>
      <PublicPageCta title={<>build the next <span>chapter with us.</span></>} />
    </PublicShell>
  )
}
