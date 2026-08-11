import "server-only"
import { createClient } from "@supabase/supabase-js"
import { createServiceSupabase } from "@/lib/admin-auth"

export async function getRequestMember(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : ""
  if (!token) return null

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )
  const { data: { user }, error } = await authClient.auth.getUser(token)
  if (error || !user?.email) return null

  const service = createServiceSupabase()
  const { data: contributor } = await service
    .from("contributors")
    .select("id, codyza_id, name, email, is_admin")
    .eq("email", user.email)
    .maybeSingle()

  return contributor || null
}
