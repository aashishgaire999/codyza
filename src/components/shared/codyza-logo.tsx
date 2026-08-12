import Image from "next/image"
import { cn } from "@/lib/utils"

const LOGO_SRC = "/logo/codyza-mark-v2.png"
const LOGO_SIZE = 512

type CodyzaLogoVariant = "full" | "nav" | "mark"

interface CodyzaLogoProps {
  size?: number
  variant?: CodyzaLogoVariant
  className?: string
  withGlow?: boolean
  priority?: boolean
  /** @deprecated Image logo — kept for call-site compatibility */
  wordmarkClassName?: string
  inverted?: boolean
}

function LogoIconMark({
  size,
  priority = false,
  className,
}: {
  size: number
  priority?: boolean
  className?: string
}) {
  const clip = Math.round(size)

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%]", className)}
      style={{ width: clip, height: clip }}
      aria-hidden
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={clip}
        height={clip}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  )
}

/** @deprecated Use CodyzaLogo — kept for call-site compatibility */
export function CodyzaMark({
  size = 32,
  className,
}: {
  size?: number
  className?: string
  inverted?: boolean
  bare?: boolean
  uid?: string
}) {
  return <CodyzaLogo size={size} variant="mark" className={className} />
}

export function CodyzaLogo({
  size = 32,
  variant = "full",
  className,
  withGlow = false,
  priority = false,
  wordmarkClassName,
}: CodyzaLogoProps) {
  if (variant === "nav") {
    const markSize = Math.round(size * 0.82)

    return (
      <span className={cn("relative inline-flex items-center gap-2.5", className)}>
        {withGlow && (
          <span
            aria-hidden
            className="absolute -inset-2 rounded-2xl opacity-30 blur-lg"
            style={{ background: "color-mix(in srgb, var(--color-codyza-blue, #302bfb) 40%, transparent)" }}
          />
        )}
        <LogoIconMark size={markSize} priority={priority} />
        <span
          className={cn(
            "bg-gradient-to-r from-[#1b14ba] to-[#302bfb] bg-clip-text text-[1.125rem] font-semibold lowercase leading-none tracking-[-0.045em] text-transparent sm:text-[1.2rem]",
            wordmarkClassName,
          )}
        >
          codyza
        </span>
      </span>
    )
  }

  if (variant === "mark") {
    return (
      <span className={cn("relative inline-flex items-center", className)}>
        <LogoIconMark size={size} priority={priority} />
      </span>
    )
  }

  const height = Math.round(size)

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      {withGlow && (
        <span
          aria-hidden
          className="absolute -inset-2 rounded-2xl opacity-30 blur-lg"
          style={{ background: "color-mix(in srgb, var(--color-codyza-blue, #302bfb) 40%, transparent)" }}
        />
      )}
      <span
        className="relative inline-flex shrink-0 overflow-hidden rounded-[22%]"
        style={{ height: `${height}px`, width: `${height}px` }}
      >
        <Image
          src={LOGO_SRC}
          alt="Codyza"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          priority={priority}
          className="h-full w-full object-contain"
        />
      </span>
    </span>
  )
}
