import { beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

let security: typeof import("./security")

beforeAll(async () => {
  security = await import("./security")
})

describe("security helpers", () => {
  it("keeps auth redirects on the Codyza origin", () => {
    expect(security.safeInternalRedirect("/member?tab=projects")).toBe("/member?tab=projects")
    expect(security.safeInternalRedirect("//evil.example/login")).toBe("/set-password")
    expect(security.safeInternalRedirect("https://evil.example")).toBe("/set-password")
    expect(security.safeInternalRedirect("/\\evil.example")).toBe("/set-password")
  })

  it("accepts only public HTTPS project links", () => {
    expect(security.safeHttpsUrl("https://github.com/codyza/project", { githubRepository: true })).toBe("https://github.com/codyza/project")
    expect(security.safeHttpsUrl("javascript:alert(1)")).toBeNull()
    expect(security.safeHttpsUrl("http://localhost:3000")).toBeNull()
    expect(security.safeHttpsUrl("https://user:pass@example.com")).toBeNull()
  })

  it("checks image bytes instead of trusting the MIME label", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(security.verifiedImageType(png, "image/png")).toBe("image/png")
    expect(security.verifiedImageType(png, "image/jpeg")).toBeNull()
  })
})
