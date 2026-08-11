/**
 * Public-page scroll boundary.
 *
 * Native scrolling keeps input response immediate, remains interruptible, and
 * lets browser scroll events drive progress and in-view animation correctly.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
