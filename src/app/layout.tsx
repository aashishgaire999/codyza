import type { Metadata, Viewport } from "next"
import { spaceMono, syne, jetbrainsMono } from "@/lib/fonts"
import { SITE_CONFIG } from "@/constants/site"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "developer ecosystem",
    "startup incubator",
    "open source",
    "developer community",
    "SaaS",
    "AI tools",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Codyza" }],
  creator: "Codyza",
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: "website",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  icons: {
    icon: "/logo/codyza-logo.png",
    apple: "/logo/codyza-logo.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-mono antialiased",
          spaceMono.variable,
          syne.variable,
          jetbrainsMono.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}