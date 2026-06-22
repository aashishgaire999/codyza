import Image from "next/image"
import { cn } from "@/lib/utils"

interface CodyzaLogoProps {
  size?: number
  className?: string
  withGlow?: boolean
  priority?: boolean
}

export function CodyzaLogo({
  size = 80,
  className,
  withGlow = false,
  priority = false,
}: CodyzaLogoProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      {withGlow && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl opacity-40 blur-xl"
          style={{ background: "color-mix(in srgb, var(--accent) 50%, transparent)" }}
        />
      )}
      <Image
        src="/logo/codyza-logo.png"
        alt="Codyza"
        width={size}
        height={size}
        priority={priority}
        className="relative rounded-2xl"
      />
    </div>
  )
}
