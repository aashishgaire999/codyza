"use client"

import { motion } from "framer-motion"
import { GitBranch, Rocket } from "lucide-react"
import { CHAPTER_PANELS } from "@/constants/landing"
import { FadeInView } from "@/components/effects/fade-in-view"

function ChapterVisual({ type }: { type: (typeof CHAPTER_PANELS)[number]["visual"] }) {
  if (type === "deploy") {
    const lines = [
      <>
        <span className="cz-chapter-terminal-prompt">$</span> git push origin main
      </>,
      <span className="cz-chapter-terminal-success">✓ build passed</span>,
      <span className="cz-chapter-terminal-muted">→ deploying to production…</span>,
      <span className="cz-chapter-terminal-live">
        <span className="cz-live-dot" /> live at codyza.app
      </span>,
    ]
    return (
      <div className="cz-chapter-visual cz-chapter-visual--deploy" aria-hidden>
        <div className="cz-chapter-terminal cz-chapter-terminal--hero">
          <div className="cz-chapter-terminal-bar">
            <span className="cz-chapter-terminal-dot cz-chapter-terminal-dot--red" />
            <span className="cz-chapter-terminal-dot cz-chapter-terminal-dot--yellow" />
            <span className="cz-chapter-terminal-dot cz-chapter-terminal-dot--green" />
            <span className="cz-chapter-terminal-bar-label">codyza — main</span>
          </div>
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.15 + i * 0.16, duration: 0.35, ease: "easeOut" }}
            >
              {line}
            </motion.p>
          ))}
        </div>
        <motion.div
          className="cz-chapter-deploy-badge"
          initial={{ opacity: 0, scale: 0.75 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: 0.9, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Rocket className="h-3.5 w-3.5" strokeWidth={1.75} />
          shipped in 47s
        </motion.div>
      </div>
    )
  }

  if (type === "skills") {
    const diffLines = [
      <span className="cz-chapter-diff-remove">{"- return <OldWizard />"}</span>,
      <span className="cz-chapter-diff-add">{"+ return <Steps count={3} />"}</span>,
      <span className="cz-chapter-diff-add">+ export const onboarding = true</span>,
    ]
    return (
      <div className="cz-chapter-visual cz-chapter-visual--learn" aria-hidden>
        <div className="cz-chapter-pr-card">
          <div className="cz-chapter-pr-header">
            <GitBranch className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>feature/onboarding-flow</span>
            <span className="cz-chapter-pr-status">merged</span>
          </div>
          <div className="cz-chapter-pr-diff">
            {diffLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: 0.15 + i * 0.16, duration: 0.35, ease: "easeOut" }}
              >
                {line}
              </motion.p>
            ))}
          </div>
          <motion.div
            className="cz-chapter-pr-comment"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: 0.75, duration: 0.4, ease: "easeOut" }}
          >
            <span className="cz-chapter-avatar-pair">
              <span className="cz-chapter-avatar">M</span>
              <span className="cz-chapter-avatar cz-chapter-avatar--2">A</span>
            </span>
            <p>&ldquo;clean refactor — ship it.&rdquo;</p>
          </motion.div>
        </div>
      </div>
    )
  }

  const crew = ["CZ", "A", "M", "R"]
  return (
    <div className="cz-chapter-visual cz-chapter-visual--grow" aria-hidden>
      <div className="cz-chapter-crew">
        {crew.map((initials, i) => (
          <motion.span
            key={initials}
            className={`cz-chapter-crew-avatar cz-chapter-crew-avatar--${i}`}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: i * 0.12, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {initials}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="cz-chapter-xp-card"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ delay: 0.55, duration: 0.45, ease: "easeOut" }}
      >
        <span className="cz-micro">leaderboard</span>
        <p className="cz-chapter-xp-value">1,150 xp</p>
        <p className="cz-chapter-xp-meta">3-day streak · czx-0042</p>
      </motion.div>
    </div>
  )
}

function ChapterBackdrop() {
  return (
    <>
      <div className="cz-chapter-bg" aria-hidden />
      <div className="cz-chapter-noise" aria-hidden />
    </>
  )
}

function ChapterBody({ panel }: { panel: (typeof CHAPTER_PANELS)[number] }) {
  return (
    <>
      <FadeInView variant="default" className="cz-chapter-copy">
        <p className="cz-micro mb-6">
          {panel.num} / {panel.word}
        </p>
        <p className="cz-chapter-accent">{panel.accent}</p>
        <h2 className="cz-chapter-headline">{panel.headline}</h2>
        <p className="cz-chapter-body">{panel.body}</p>
        <ul className="cz-chapter-highlights">
          {panel.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </FadeInView>
      <FadeInView variant="subtle" delay={120}>
        <ChapterVisual type={panel.visual} />
      </FadeInView>
    </>
  )
}

export function Chapters() {
  return (
    <section aria-label="Ship, learn, grow" className="cz-chapters cz-border-t">
      {CHAPTER_PANELS.map((panel) => (
        <article
          key={panel.id}
          id={`chapter-${panel.id}`}
          className={`cz-chapter-panel cz-chapter-panel--${panel.id}`}
        >
          <ChapterBackdrop />
          <div className="cz-chapter-layout mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
            <ChapterBody panel={panel} />
          </div>
        </article>
      ))}
    </section>
  )
}
