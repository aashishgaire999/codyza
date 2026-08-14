import { describe, expect, it } from "vitest"
import { JOIN_HREF } from "./site"

describe("public join journey", () => {
  it("always opens at the application hero", () => {
    expect(JOIN_HREF).toBe("/join#join-top")
    expect(JOIN_HREF).not.toBe("/join#application")
  })
})
