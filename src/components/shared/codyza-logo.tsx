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
  withGlow = true,
  priority = false,
}: CodyzaLogoProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      {withGlow && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl blur-2xl opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 80%)",
          }}
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