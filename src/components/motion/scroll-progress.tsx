"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed left-0 top-0 z-[100] h-[2px] w-full origin-left bg-accent"
      style={{ scaleX }}
    />
  )
}

export function ScrollHint() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) setVisible(false)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="pointer-events-none fixed bottom-8 left-1/2 z-40 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">scroll</span>
      <motion.span
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="block h-8 w-px bg-foreground/30"
      />
    </motion.div>
  )
}
