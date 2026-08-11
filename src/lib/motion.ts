/**
 * Motion tokens — single source of truth for animation timing.
 * Durations in seconds (Framer Motion convention).
 */

export const DUR = {
  micro: 0.18,
  standard: 0.28,
  enter: 0.4,
  exit: 0.26,
} as const

/** expo-out — entrances, reveals */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const
/** ease-in — exits */
export const EASE_IN = [0.4, 0, 1, 1] as const

export const SPRING = {
  /** cards, modals, drawers */
  gentle: { type: "spring", damping: 26, stiffness: 220 },
  /** button/card press feedback */
  press: { type: "spring", damping: 20, stiffness: 400 },
} as const

/** per-item stagger delay in seconds (cap the list at ~6 items) */
export const STAGGER = 0.04

/** shared whileInView reveal — usage: <motion.div {...fadeUp} /> */
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: DUR.enter, ease: EASE_OUT },
} as const
