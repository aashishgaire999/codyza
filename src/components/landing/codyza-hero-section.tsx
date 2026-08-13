"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"

export function CodyzaHeroSection({ content }: { content?: { headline?: string; copy?: string; cta?: string; cta_href?: string } }) {
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUnavailable, setVideoUnavailable] = useState(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tryPlayVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || reduceMotion) return

    try {
      video.muted = true
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) video.load()
      await video.play()
      setVideoUnavailable(false)
    } catch {
      // Some desktop browsers pause remote media until the connection is ready.
      // Keep the poster/fallback visible and let the user opt into playback.
      setVideoUnavailable(true)
    }
  }, [reduceMotion])

  const retryAfterBuffering = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    retryTimerRef.current = setTimeout(() => void tryPlayVideo(), 1200)
  }, [tryPlayVideo])

  useEffect(() => {
    if (reduceMotion) return
    const video = videoRef.current
    if (!video) return

    // Let the poster and hero text paint first. The remote MP4 is intentionally
    // attached after the first frame so a slow CDN cannot delay the page's LCP.
    const attachVideo = () => {
      const source = video.dataset.src
      if (!source || video.src) return
      video.src = source
      video.load()
      void tryPlayVideo()
    }
    const idle = "requestIdleCallback" in window
      ? window.requestIdleCallback(attachVideo, { timeout: 350 })
      : window.setTimeout(attachVideo, 80)

    const resume = () => {
      if (document.visibilityState === "visible") {
        attachVideo()
        void tryPlayVideo()
      }
    }
    document.addEventListener("visibilitychange", resume)
    window.addEventListener("pageshow", resume)
    return () => {
      if ("cancelIdleCallback" in window && typeof idle === "number") window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      document.removeEventListener("visibilitychange", resume)
      window.removeEventListener("pageshow", resume)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [reduceMotion, tryPlayVideo])

  return (
    <section className="cz-hero cz-hero--cinematic" aria-labelledby="home-title">
      <div className="cz-hero-media">
        <video
          aria-hidden="true"
          ref={videoRef}
          className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          data-src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/press/codyza-founders-illustrated.jpg"
          onCanPlay={tryPlayVideo}
          onLoadedData={tryPlayVideo}
          onLoadedMetadata={tryPlayVideo}
          onPlaying={() => setVideoUnavailable(false)}
          onWaiting={retryAfterBuffering}
          onStalled={retryAfterBuffering}
          onSuspend={retryAfterBuffering}
          onError={() => { setVideoUnavailable(true); retryAfterBuffering() }}
          disablePictureInPicture
        />
        {videoUnavailable && !reduceMotion ? (
          <button
            type="button"
            className="cz-hero-video-retry"
            onClick={() => {
              setVideoUnavailable(false)
              void tryPlayVideo()
            }}
            aria-label="Play hero background video"
          >
            play background
          </button>
        ) : null}
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-4.25rem)] max-w-[1320px]">
        <motion.div
          className="relative z-20 flex-1 px-8 md:px-16 pt-12 md:pt-16 flex flex-col items-start"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="cz-hero-copy">
          <h1 id="home-title" className="cz-hero-title">{content?.headline || "building alone gets lonely."}</h1>
          <p className="cz-hero-deck">
            {content?.copy || "Codyza is the crew for developers, designers, and ambitious builders who want to turn skills into real, shipped work."}
          </p>
          <div className="cz-hero-actions">
            <Link href={content?.cta_href || "/join"} className="cz-pill cz-pill-solid">
              {content?.cta || "join the crew"}
            </Link>
            <Link href="/projects" className="cz-hero-text-link">
              see what we build
            </Link>
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
