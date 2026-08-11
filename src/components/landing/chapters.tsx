"use client"

import { motion } from "framer-motion"
import { Check, GitBranch as Github, Globe2, Target, Users } from "lucide-react"
import { CHAPTER_PANELS } from "@/constants/landing"
import { FadeInView } from "@/components/effects/fade-in-view"

const REVEAL = {
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
} as const

function BountyVisual() {
  return (
    <div className="cz-system-visual cz-system-visual--bounty" aria-hidden>
      <div className="cz-system-bar">
        <span><Target /> open bounty</span>
        <strong>+350 XP</strong>
      </div>
      <div className="cz-system-body">
        <motion.div {...REVEAL} transition={{ delay: 0.08, duration: 0.35 }} className="cz-bounty-card">
          <div className="cz-bounty-meta"><span>product · accessibility</span><b>open</b></div>
          <strong>Audit the public project experience</strong>
          <p>Find the blockers, document the fixes, and ship the clean-up.</p>
          <div className="cz-bounty-foot"><span>2–4 hours</span><b>claim bounty</b></div>
        </motion.div>
      </div>
    </div>
  )
}

function GroupVisual() {
  return (
    <div className="cz-system-visual cz-system-visual--group" aria-hidden>
      <div className="cz-system-bar">
        <span><Users /> project group</span>
        <strong>active</strong>
      </div>
      <div className="cz-system-body">
        <motion.div {...REVEAL} transition={{ delay: 0.08, duration: 0.35 }} className="cz-group-card">
          <div className="cz-group-top">
            <div>
              <small>crew / atlas</small>
              <strong>Member onboarding</strong>
            </div>
            <span>4 members</span>
          </div>
          <div className="cz-group-faces"><i>AG</i><i>PS</i><i>SN</i><i>+1</i></div>
          <div className="cz-group-mission"><Check /><span>shared mission</span><b>in progress</b></div>
          <div className="cz-group-mission"><Check /><span>roles assigned</span><b>ready</b></div>
        </motion.div>
      </div>
    </div>
  )
}

function SubmissionVisual() {
  return (
    <div className="cz-system-visual cz-system-visual--submission" aria-hidden>
      <div className="cz-system-bar">
        <span><Globe2 /> project submission</span>
        <strong>approved</strong>
      </div>
      <div className="cz-system-body">
        <motion.div {...REVEAL} transition={{ delay: 0.08, duration: 0.35 }} className="cz-submission-card">
          <div className="cz-submission-status"><span><Check /> crew reviewed</span><b>+320 XP</b></div>
          <strong>Public project experience</strong>
          <p>Repository, live product, and ownership recorded together.</p>
          <div className="cz-submission-links">
            <span><Github /> repository</span>
            <span><Globe2 /> live URL</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ChapterVisual({ type }: { type: (typeof CHAPTER_PANELS)[number]["visual"] }) {
  if (type === "bounty") return <BountyVisual />
  if (type === "group") return <GroupVisual />
  return <SubmissionVisual />
}

export function Chapters() {
  return (
    <section aria-label="How Codyza works" className="cz-process cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <FadeInView variant="headline" className="cz-process-heading">
          <p className="cz-kicker">the member system</p>
          <h2>inside Codyza Quest.</h2>
        </FadeInView>

        <div className="cz-process-grid">
          {CHAPTER_PANELS.map((panel, index) => (
            <FadeInView key={panel.id} delay={index * 70}>
              <article id={`chapter-${panel.id}`} className="cz-process-step">
                <ChapterVisual type={panel.visual} />
                <div className="cz-process-copy">
                  <p className="cz-micro">{panel.num} / {panel.word}</p>
                  <h3 className="cz-chapter-headline">{panel.headline}</h3>
                  <ul className="cz-chapter-highlights">
                    {panel.highlights.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </article>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  )
}
