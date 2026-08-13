"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { JOIN_HREF } from "@/constants/site"

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4"

export function CodyzaHeroSection({ content }: { content?: { headline?: string; copy?: string; cta?: string; cta_href?: string } }) {
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUnavailable, setVideoUnavailable] = useState(false)
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playPendingRef = useRef(false)
  const retryCountRef = useRef(0)
  const lastPlaybackTimeRef = useRef(0)
  const frozenChecksRef = useRef(0)

  const tryPlayVideo = useCallback(async () => {
    const video = videoRef.current
    if (!video || document.visibilityState !== "visible" || playPendingRef.current) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true

    // Calling play before Safari has decoded a frame can reject even though
    // autoplay is allowed. The media events below will try again when ready.
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return

    playPendingRef.current = true
    try {
      await video.play()
      retryCountRef.current = 0
      setVideoUnavailable(false)
    } catch {
      retryCountRef.current += 1
      if (retryCountRef.current >= 4) setVideoUnavailable(true)
    } finally {
      playPendingRef.current = false
    }
  }, [])

  const revealFirstFrame = useCallback(() => {
    const video = videoRef.current
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setFirstFrameReady(true)
    }
  }, [])

  const schedulePlayback = useCallback((delay = 250) => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    retryTimerRef.current = setTimeout(() => {
      void tryPlayVideo()
    }, delay)
  }, [tryPlayVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const resume = () => {
      if (document.visibilityState === "visible") schedulePlayback(0)
    }

    // A small watchdog makes playback independent of unrelated clicks or
    // overlays. It also recovers from Safari occasionally reporting "playing"
    // while leaving the decoded frame frozen after a tab/focus transition.
    const watchdog = window.setInterval(() => {
      if (document.visibilityState !== "visible") return

      if (video.paused || video.ended) {
        schedulePlayback(0)
        return
      }

      if (Math.abs(video.currentTime - lastPlaybackTimeRef.current) < 0.01) {
        frozenChecksRef.current += 1
      } else {
        frozenChecksRef.current = 0
        lastPlaybackTimeRef.current = video.currentTime
      }

      if (frozenChecksRef.current >= 3 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        frozenChecksRef.current = 0
        video.pause()
        schedulePlayback(0)
      }
    }, 1200)

    schedulePlayback(0)
    document.addEventListener("visibilitychange", resume)
    window.addEventListener("pageshow", resume)
    window.addEventListener("focus", resume)
    window.addEventListener("online", resume)
    return () => {
      document.removeEventListener("visibilitychange", resume)
      window.removeEventListener("pageshow", resume)
      window.removeEventListener("focus", resume)
      window.removeEventListener("online", resume)
      window.clearInterval(watchdog)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [schedulePlayback])

  return (
    <section className="cz-hero cz-hero--cinematic" aria-labelledby="home-title">
      <div className="cz-hero-media">
        <div className="cz-hero-placeholder" aria-hidden="true" />
        <video
          aria-hidden="true"
          ref={videoRef}
          className="w-full h-full object-cover scale-105 transition-transform duration-1000"
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={{ opacity: firstFrameReady ? 1 : 0 }}
          onCanPlay={() => {
            revealFirstFrame()
            schedulePlayback(0)
          }}
          onLoadedData={() => {
            revealFirstFrame()
            schedulePlayback(0)
          }}
          onPlaying={() => {
            revealFirstFrame()
            retryCountRef.current = 0
            lastPlaybackTimeRef.current = videoRef.current?.currentTime ?? 0
            frozenChecksRef.current = 0
            setVideoUnavailable(false)
          }}
          onPause={() => schedulePlayback()}
          onWaiting={() => schedulePlayback(500)}
          onStalled={() => schedulePlayback(500)}
          onError={() => {
            setVideoUnavailable(true)
            schedulePlayback(1000)
          }}
          disablePictureInPicture
        />
        {videoUnavailable && !reduceMotion ? (
          <button
            type="button"
            className="cz-hero-video-retry"
            onClick={() => {
              setVideoUnavailable(false)
              retryCountRef.current = 0
              schedulePlayback(0)
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
          initial={false}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="cz-hero-copy">
          <h1 id="home-title" className="cz-hero-title">{content?.headline || "building alone gets lonely."}</h1>
          <p className="cz-hero-deck">
            {content?.copy || "Codyza is the crew for developers, designers, and ambitious builders who want to turn skills into real, shipped work."}
          </p>
          <div className="cz-hero-actions">
            <Link href={content?.cta_href === "/join" ? JOIN_HREF : content?.cta_href || JOIN_HREF} className="cz-pill cz-pill-solid">
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
