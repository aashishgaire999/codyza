import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"

type InviteResult =
  | { ok: true }
  | { ok: false; status: number; error: string }

// Supabase only resends invite-type emails through the admin API -- the
// public magic-link endpoint silently does nothing for a user who was
// invited but never confirmed. This checks the account's real confirmation
// status (requires the service role, so it can only run server-side) and
// either sends a fresh invite or reports that the account is already set up.
export async function resendOrInvite(service: SupabaseClient, email: string, siteUrl: string): Promise<InviteResult> {
  const { data: userList, error: listError } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listError) {
    console.error("resendOrInvite: could not list users", listError)
    return { ok: false, status: 500, error: "Could not send the invite. Please try again shortly." }
  }
  const existingUser = userList.users.find((user) => user.email?.toLowerCase() === email)

  if (existingUser?.confirmed_at) {
    return {
      ok: false,
      status: 409,
      error: "This account is already set up. Sign in at /login, or use \"email me a login link\" there.",
    }
  }

  const { error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/set-password`,
  })
  if (inviteError) {
    console.error("resendOrInvite: invite failed", inviteError)
    return { ok: false, status: 500, error: "Could not send the invite. Please try again shortly." }
  }

  return { ok: true }
}
