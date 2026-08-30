// Next.js calls onRequestError for any unhandled exception that reaches its
// error boundary, across route handlers, server components, and middleware --
// see node_modules/next/dist/server/instrumentation/types.d.ts for the exact
// signature this file implements. This does not catch errors an API route
// already catches and returns as a normal JSON response (most of this app's
// routes do that); it's for genuine crashes that would otherwise go unnoticed
// until someone reports them.

const ALERT_EMAIL = process.env.ALERT_EMAIL || "aashishgaire042@gmail.com"
const MAX_ALERTS_PER_HOUR = 20
const REPEAT_COOLDOWN_MS = 15 * 60 * 1000

type AlertState = {
  sentThisHour: number
  hourResetAt: number
  lastSentByKey: Map<string, number>
}

const globalState = globalThis as typeof globalThis & { __codyzaAlertState?: AlertState }

function getState(): AlertState {
  if (!globalState.__codyzaAlertState) {
    globalState.__codyzaAlertState = { sentThisHour: 0, hourResetAt: Date.now() + 60 * 60 * 1000, lastSentByKey: new Map() }
  }
  return globalState.__codyzaAlertState
}

export async function onRequestError(
  error: unknown,
  errorRequest: Readonly<{ path: string; method: string }>,
  errorContext: Readonly<{ routePath: string; routeType: string }>,
) {
  // The Resend SDK and this in-memory cooldown store only need to run once
  // per crash, and the edge runtime doesn't share memory with node -- skip
  // there so we don't double-send or fail on APIs edge doesn't have.
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  try {
    const state = getState()
    const now = Date.now()
    if (now > state.hourResetAt) {
      state.sentThisHour = 0
      state.hourResetAt = now + 60 * 60 * 1000
    }
    if (state.sentThisHour >= MAX_ALERTS_PER_HOUR) return

    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    const key = `${errorRequest.method} ${errorRequest.path}: ${message}`.slice(0, 200)

    const lastSent = state.lastSentByKey.get(key)
    if (lastSent && now - lastSent < REPEAT_COOLDOWN_MS) return
    state.lastSentByKey.set(key, now)
    state.sentThisHour += 1

    if (!process.env.RESEND_API_KEY) {
      console.error("crash alert (RESEND_API_KEY not set, email skipped):", key)
      return
    }

    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "Codyza Alerts <team@codyza.com>",
      to: ALERT_EMAIL,
      subject: `Codyza crash: ${errorRequest.method} ${errorRequest.path}`,
      text: [
        `Route: ${errorContext.routePath} (${errorContext.routeType})`,
        `Request: ${errorRequest.method} ${errorRequest.path}`,
        `Error: ${message}`,
        stack ? `\nStack:\n${stack}` : "",
      ].join("\n"),
    })
  } catch (alertError) {
    console.error("onRequestError alert failed", alertError)
  }
}
