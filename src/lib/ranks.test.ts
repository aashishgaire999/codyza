import { describe, it, expect } from "vitest"
import { RANKS, getRankFromXP, getNextRank } from "./ranks"

describe("getRankFromXP", () => {
  it("returns Apprentice at 0 XP", () => {
    expect(getRankFromXP(0).name).toBe("Apprentice")
  })

  it("returns the lower rank just below a boundary", () => {
    expect(getRankFromXP(1499).name).toBe("Associate Engineer")
  })

  it("returns the higher rank exactly at a boundary", () => {
    expect(getRankFromXP(1500).name).toBe("Software Engineer")
  })

  it("returns the top rank for XP beyond the highest threshold", () => {
    expect(getRankFromXP(1_000_000).name).toBe("Codyza Fellow")
  })

  it("never returns undefined for negative XP", () => {
    expect(getRankFromXP(-100).name).toBe("Apprentice")
  })
})

describe("getNextRank", () => {
  it("returns the next rank just below its boundary", () => {
    expect(getNextRank(1499)?.name).toBe("Software Engineer")
  })

  it("returns null once XP is at or beyond the top rank", () => {
    const topRank = RANKS[RANKS.length - 1]
    expect(getNextRank(topRank.minXP)).toBeNull()
  })

  it("returns the first rank for negative XP", () => {
    expect(getNextRank(-100)?.name).toBe(RANKS[0].name)
  })
})
