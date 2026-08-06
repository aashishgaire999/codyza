"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Award, Brain, Code2, GitBranch, Layers, Rocket, Star, Trophy, Users } from "lucide-react"
import { FadeInView } from "@/components/effects/fade-in-view"

const FEATURES = [
  {
    icon: Code2,
    title: "real projects",
    desc: "Ship code to live users. No tutorials, no throwaway demos.",
    detail: "Work on production codebases with real users, real bugs, and real deadlines. Every PR you merge ships to the internet.",
    stat: "live deployments",
  },
  {
    icon: Brain,
    title: "AI systems",
    desc: "Build with Claude, Gemini, and modern AI workflows.",
    detail: "Get hands-on experience integrating LLMs, AI APIs, automation systems, and production-ready AI features.",
    stat: "real API integrations",
  },
  {
    icon: Rocket,
    title: "SaaS deployment",
    desc: "Deploy to Vercel and modern production environments.",
    detail: "Learn GitHub workflows, CI/CD, domains, hosting, environment variables, and real deployment systems.",
    stat: "vercel + production",
  },
  {
    icon: Users,
    title: "team collaboration",
    desc: "Startup-style teamwork and real contributor systems.",
    detail: "Work with developers, designers, and contributors using real collaboration workflows and code reviews.",
    stat: "global contributors",
  },
  {
    icon: GitBranch,
    title: "GitHub integration",
    desc: "Every commit and project tied to your public profile.",
    detail: "Build a verified technical portfolio using GitHub repositories, pull requests, deployments, and contributions.",
    stat: "public contribution history",
  },
  {
    icon: Star,
    title: "contributor recognition",
    desc: "Your impact becomes visible and publicly recognized.",
    detail: "Get featured through leaderboards, contributor credits, project showcases, and community recognition.",
    stat: "leaderboard system",
  },
  {
    icon: Layers,
    title: "XP & ranking system",
    desc: "Earn recognition through deployments and contributions.",
    detail: "Gain XP from shipped projects, deployments, teamwork, and technical contribution milestones.",
    stat: "contributor rankings",
  },
  {
    icon: Award,
    title: "developer certificates",
    desc: "Certificates based on real contributions and deployments.",
    detail: "Receive contributor certificates tied to actual work, deployments, and public GitHub activity.",
    stat: "certificate eligible",
  },
  {
    icon: Trophy,
    title: "leaderboards",
    desc: "Compete and grow alongside the Codyza community.",
    detail: "Track active contributors, deployments, and shipped projects through public leaderboard systems.",
    stat: "monthly rankings",
  },
] as const

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = feature.icon

  return (
    <FadeInView delay={(index % 3) * 70}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="cz-feature-card group"
      >
        <div className="cz-feature-icon">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="cz-feature-title">{feature.title}</h3>
        <p className="cz-feature-desc">{feature.desc}</p>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="cz-feature-detail">
                <p>{feature.detail}</p>
                <span className="cz-feature-stat">
                  <span className="cz-live-dot" />
                  {feature.stat}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="cz-feature-toggle" aria-hidden>
          {expanded ? "− less" : "+ more"}
        </span>
      </button>
    </FadeInView>
  )
}

export function Features() {
  return (
    <section className="cz-section scroll-mt-24 cz-border-t px-5 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px]">
        <FadeInView variant="subtle">
          <p className="cz-micro mb-8">004 / the platform</p>
        </FadeInView>
        <FadeInView variant="headline" delay={80}>
          <h2 className="cz-display max-w-3xl">
            build real products.
            <br />
            <span className="cz-headline-muted">gain real experience.</span>
          </h2>
        </FadeInView>
        <FadeInView variant="subtle" delay={180}>
          <p className="cz-body mt-7 max-w-xl">
            Codyza is a modern contributor ecosystem — developers collaborate, ship production-ready
            applications, deploy real projects, and grow through practical technical experience.
          </p>
        </FadeInView>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
