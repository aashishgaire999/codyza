"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

function ChapterLetter({
  letter,
  index,
  total,
  scrollYProgress,
}: {
  letter: string
  index: number
  total: number
  scrollYProgress: MotionValue<number>
}) {
  const start = index / total
  const end = (index + 1) / total
  const opacity = useTransform(scrollYProgress, [start * 0.6, end * 0.6 + 0.15], [0, 1])
  const y = useTransform(scrollYProgress, [start * 0.6, end * 0.6 + 0.15], ["110%", "0%"])

  return (
    <motion.span style={{ opacity, y }} className="sofi-headline-section inline-block text-black">
      {letter}
    </motion.span>
  )
}

function PinnedWord({ word, num }: { word: string; num: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  if (reduced) {
    return (
      <section className="sofi-edge-bar py-24 text-center">
        <p className="sofi-micro mb-4">{num}</p>
        <p className="sofi-headline-section">{word}</p>
      </section>
    )
  }

  return (
    <section ref={containerRef} className="relative h-[180vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <p className="sofi-micro absolute left-4 top-8 sm:left-8">{num}</p>
        <div className="sofi-edge-bar flex w-full items-center justify-center py-10 md:py-14">
          <div className="flex overflow-hidden">
            {word.split("").map((letter, i) => (
              <ChapterLetter key={`${letter}-${i}`} letter={letter} index={i} total={word.length} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const CHAPTERS = [
  { num: "002", word: "ship" },
  { num: "003", word: "learn" },
  { num: "004", word: "grow" },
]

export function SofiChapters() {
  return (
    <>
      {CHAPTERS.map((c) => (
        <PinnedWord key={c.word} word={c.word} num={c.num} />
      ))}
    </>
  )
}
