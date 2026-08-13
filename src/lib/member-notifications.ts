import "server-only"

import { createServiceSupabase } from "@/lib/admin-auth"

type NotificationInput = {
  type: string
  message: string
  link?: string
  excludeCodyzaId?: string
}

/** Fan out a non-private event to the member notification inbox. */
export async function notifyAllMembers({ type, message, link = "/member", excludeCodyzaId }: NotificationInput) {
  try {
    const supabase = createServiceSupabase()
    const { data: members, error } = await supabase.from("contributors").select("codyza_id")
    if (error || !members?.length) return

    const rows = members
      .filter((member) => member.codyza_id !== excludeCodyzaId)
      .map((member) => ({ codyza_id: member.codyza_id, type, message, link }))
    if (rows.length) await supabase.from("notifications").insert(rows)
  } catch {
    // Notifications must never make publishing/onboarding fail.
  }
}

export async function notifyMember(codyzaId: string, { type, message, link = "/member" }: Omit<NotificationInput, "excludeCodyzaId">) {
  try {
    await createServiceSupabase().from("notifications").insert({ codyza_id: codyzaId, type, message, link })
  } catch {
    // Notifications are best-effort.
  }
}
