/**
 * Font variable classes used by the root layout.
 *
 * Keep development and production builds independent of Google Fonts network
 * requests. The CSS variables resolve to native system stacks in globals.css.
 */
export const inter = {
  variable: "font-inter-system",
} as const

export const jetbrainsMono = {
  variable: "font-jetbrains-mono-system",
} as const

export const instrumentSerif = {
  variable: "font-instrument-system",
} as const
