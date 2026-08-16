import { z } from "zod"

export const projectSubmissionSchema = z.object({
  project_name: z.string().trim().min(2).max(180),
  github_url: z.string().max(500),
  live_url: z.string().max(500).optional().nullable(),
  description: z.string().trim().min(20).max(5000),
  tech_stack: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
}).strip()

export function calculateProjectXp({
  hasLiveUrl,
  lastSubmission,
  currentStreak,
  now = new Date(),
}: {
  hasLiveUrl: boolean
  lastSubmission?: string | null
  currentStreak?: number | null
  now?: Date
}) {
  const base = 100
  const deploy = hasLiveUrl ? 150 : 0
  const lastSubmissionDate = lastSubmission ? new Date(lastSubmission) : null
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const lastSubmissionUtc = lastSubmissionDate && !Number.isNaN(lastSubmissionDate.getTime())
    ? Date.UTC(
        lastSubmissionDate.getUTCFullYear(),
        lastSubmissionDate.getUTCMonth(),
        lastSubmissionDate.getUTCDate(),
      )
    : Number.NaN
  const daysSinceLastSubmission = (todayUtc - lastSubmissionUtc) / (1000 * 60 * 60 * 24)
  const nextStreak = Number.isFinite(daysSinceLastSubmission)
    && daysSinceLastSubmission >= 0
    && daysSinceLastSubmission <= 7
    ? (currentStreak || 0) + 1
    : 1
  const streak = nextStreak >= 4 ? 200 : nextStreak >= 2 ? 50 : 0

  // AI feedback is advisory. Quality XP must never be authorized by a model.
  const quality = 0

  return { base, deploy, quality, streak, total: base + deploy + quality + streak }
}
