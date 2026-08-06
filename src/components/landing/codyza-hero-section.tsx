"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient, getNextRank } from "@/lib/supabase"
import { CzxIdCard } from "@/components/shared/czx-id-card"

export function CodyzaHeroSection() {
  const [featured, setFeatured] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("contributors").select("*").order("xp", { ascending: false }).limit(1)
      setFeatured(data?.[0] || null)
    }
    load()
  }, [])

  return (
    <div className="w-full px-4 pb-8 pt-20 md:px-8 md:pt-24">
      <section className="relative mx-auto min-h-[600px] w-full max-w-[1400px] overflow-hidden rounded-[48px] border border-black/[0.06] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 100% 0%, rgba(48,43,251,0.14) 0%, rgba(48,43,251,0.03) 45%, transparent 70%)",
            }}
            aria-hidden
          />
          <div className="cz-aurora" aria-hidden />
        </div>

        <div className="relative z-20 grid grid-cols-1 items-center gap-12 px-8 py-16 md:px-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start"
          >
            <h1 className="font-display text-[42px] font-normal leading-[1.02] tracking-tight text-[#0a0a0a] lowercase md:text-[56px]">
              building alone
              <br />
              gets lonely.
            </h1>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-black/55 md:text-[15px]">
              Codyza is a community of devs, designers, and dreamers shipping real projects together. Not a
              bootcamp. Not another chat server. Free to join, built to last.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-8">
              <Link
                href="/apply"
                className="inline-block rounded-full bg-[#0a0a0a] px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
              >
                Apply to join
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute h-[380px] w-[380px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(48,43,251,0.55) 0%, rgba(48,43,251,0.28) 35%, transparent 70%)",
                filter: "blur(60px)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute h-[180px] w-[180px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(139,135,255,0.9) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.95, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <div className="relative w-full max-w-[320px]">
              <CzxIdCard
                variant="dark"
                id={featured?.codyza_id?.replace(/^CZX-/i, "") || "0001"}
                name={featured?.name || "your name here"}
                rank={featured?.rank || "Apprentice"}
                xp={featured?.xp || 0}
                xpMax={featured ? getNextRank(featured.xp || 0)?.minXP ?? featured.xp : 500}
                joined={
                  featured?.joined_at
                    ? new Date(featured.joined_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "—"
                }
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
