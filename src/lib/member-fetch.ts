"use client"

import { createClient } from "@/lib/supabase"

export async function memberFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const { data: { session } } = await createClient().auth.getSession()
  const headers = new Headers(init.headers)
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}
