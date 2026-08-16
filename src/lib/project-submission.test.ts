import { describe, expect, it } from "vitest"
import { calculateProjectXp, projectSubmissionSchema } from "./project-submission"

const personalProject = {
  project_name: "Independent portfolio",
  github_url: "https://github.com/example/portfolio",
  live_url: "https://portfolio.example.com",
  description: "A personal project built independently by a Codyza member.",
  tech_stack: ["Next.js", "TypeScript"],
}

describe("personal project submissions", () => {
  it("accepts a project without any bounty", () => {
    const result = projectSubmissionSchema.parse(personalProject)
    expect(result.project_name).toBe("Independent portfolio")
    expect(result).not.toHaveProperty("bounty_id")
  })

  it("strips a legacy bounty field instead of sending it to the database", () => {
    const result = projectSubmissionSchema.parse({ ...personalProject, bounty_id: "legacy-bounty" })
    expect(result).not.toHaveProperty("bounty_id")
  })

  it("prepares XP for admin approval", () => {
    expect(calculateProjectXp({ hasLiveUrl: false })).toEqual({
      base: 100,
      deploy: 0,
      quality: 0,
      streak: 0,
      total: 100,
    })
    expect(calculateProjectXp({ hasLiveUrl: true })).toEqual({
      base: 100,
      deploy: 150,
      quality: 0,
      streak: 0,
      total: 250,
    })
  })

  it("counts a submission exactly seven calendar days ago toward the streak", () => {
    expect(calculateProjectXp({
      hasLiveUrl: false,
      lastSubmission: "2026-08-09T23:59:59Z",
      currentStreak: 1,
      now: new Date("2026-08-16T23:59:59Z"),
    }).streak).toBe(50)
  })
})
