"use client"

import { ArrowUpRight, Mail } from "lucide-react"
import { SITE_CONFIG } from "@/constants/site"

export function Spotlight() {
  const steps = [
    { num: "01", label: "Tell us what you need" },
    { num: "02", label: "Get matched with a builder" },
    { num: "03", label: "Launch your site" },
  ]
  return (
    <aside className="cz-spotlight">
      <div className="cz-spotlight-glow" aria-hidden />
      <div className="cz-spotlight-link">
        <div className="cz-spotlight-main">
          <span className="cz-spotlight-label">Web builds · Volunteer crew</span>
          <p className="cz-spotlight-title">Get your website.</p>
          <p className="cz-spotlight-desc">
            Designed by skilled volunteers and built at an affordable cost — with a real team, not a
            template.
          </p>
          <ol className="cz-spotlight-steps">
            {steps.map((step) => (
              <li key={step.num}>
                <span className="cz-spotlight-step-num">{step.num}</span>
                {step.label}
              </li>
            ))}
          </ol>
        </div>
        <a
          href={`mailto:${SITE_CONFIG.email}?subject=Website%20build%20inquiry`}
          className="cz-spotlight-cta group"
        >
          <span className="cz-spotlight-cta-icon" aria-hidden>
            <Mail className="h-5 w-5" />
          </span>
          <p className="cz-spotlight-cta-title">Start a project</p>
          <p className="cz-spotlight-cta-email">{SITE_CONFIG.email}</p>
          <span className="cz-spotlight-cta-button">
            Send an email
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </a>
      </div>
    </aside>
  )
}
