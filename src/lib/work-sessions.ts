import "server-only"
import { createServiceSupabase } from "@/lib/admin-auth"

// Kept in sync with the 12h cap baked into the expire_stale_work_sessions()
// Postgres function (supabase/migrations/20260908020000_...).
export const MAX_SESSION_MINUTES = 720

type ServiceSupabase = ReturnType<typeof createServiceSupabase>

// Closes out any session that's been active longer than MAX_SESSION_MINUTES,
// capping its duration at exactly that many minutes instead of trusting raw
// elapsed time. Called at the top of every work-session read/write path so a
// forgotten clock-out self-heals the moment anyone next looks, with no cron.
export async function expireStaleWorkSessions(supabase: ServiceSupabase) {
  const { data, error } = await supabase.rpc("expire_stale_work_sessions", { p_max_minutes: MAX_SESSION_MINUTES })
  if (error) {
    console.error("expire_stale_work_sessions failed", { code: error.code, message: error.message })
    return
  }

  const closed = data || []
  if (!closed.length) return

  await supabase.from("notifications").insert(
    closed.map((session: { codyza_id: string }) => ({
      codyza_id: session.codyza_id,
      type: "session_auto_closed",
      message: `Your work session was auto-closed after ${MAX_SESSION_MINUTES / 60}h. Check your history if that doesn't look right.`,
      link: "/member/standup",
    })),
  )
}
