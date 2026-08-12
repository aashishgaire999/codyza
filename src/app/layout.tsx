import type { Metadata, Viewport } from "next"
import { inter, jetbrainsMono, instrumentSerif } from "@/lib/fonts"
import { SITE_CONFIG } from "@/constants/site"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { PwaProvider } from "@/components/providers/pwa-provider"
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
  applicationName: "Codyza",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Codyza",
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: "website",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [{ url: SITE_CONFIG.ogImage, width: 512, height: 512, alt: SITE_CONFIG.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon.png?v=3", sizes: "64x64", type: "image/png" },
      { url: "/logo/codyza-mark-v2.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png?v=3",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
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
          jetbrainsMono.variable,
          instrumentSerif.variable
        )}
      >
        <ThemeProvider>
          <PwaProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
