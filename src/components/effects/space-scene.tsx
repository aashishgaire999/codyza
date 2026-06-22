"use client"

import { GalaxyBackground } from "@/components/effects/galaxy-background"
import { AsteroidField } from "@/components/effects/asteroid-field"
import type { GalaxyVariant } from "@/components/effects/galaxy-background"

type SpaceSceneProps = {
  scrollY?: number
  variant?: GalaxyVariant
  asteroids?: boolean
  asteroidDensity?: "light" | "normal" | "heavy"
}

/** Unified deep-space backdrop: galaxy nebula + optional asteroid drift. */
export function SpaceScene({
  scrollY = 0,
  variant = "default",
  asteroids = true,
  asteroidDensity = "normal",
}: SpaceSceneProps) {
  return (
    <>
      <GalaxyBackground scrollY={scrollY} variant={variant} />
      {asteroids && <AsteroidField scrollY={scrollY} density={asteroidDensity} />}
    </>
  )
}
