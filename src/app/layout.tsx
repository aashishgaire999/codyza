import type { Metadata, Viewport } from "next"
import { inter, spaceMono, syne, jetbrainsMono, fraunces, instrumentSerif } from "@/lib/fonts"
import { SITE_CONFIG } from "@/constants/site"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          spaceMono.variable,
          syne.variable,
          jetbrainsMono.variable,
          fraunces.variable,
          instrumentSerif.variable
        )}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
