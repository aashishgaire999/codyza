import type { Metadata } from "next"

const SITE_URL = "https://codyza.com"
const SHARE_IMAGE = "/logo/codyza-mark-v2.png"

export function publicMetadata(title: string, description: string, path: string): Metadata {
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Codyza",
      title: `${title} | Codyza`,
      description,
      images: [{ url: SHARE_IMAGE, width: 512, height: 512, alt: "Codyza" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Codyza`,
      description,
      images: [SHARE_IMAGE],
    },
  }
}
