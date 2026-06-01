import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const RANKS = [
  { name: "Apprentice", minXP: 0, color: "#94a3b8", icon: "seedling" },
  { name: "Associate Engineer", minXP: 500, color: "#22c55e", icon: "code" },
  { name: "Software Engineer", minXP: 1500, color: "#3b82f6", icon: "cpu" },
  { name: "Senior Engineer", minXP: 3500, color: "#8b5cf6", icon: "bolt" },
  { name: "Staff Engineer", minXP: 7000, color: "#f59e0b", icon: "crown" },
  { name: "Principal Engineer", minXP: 12000, color: "#ef4444", icon: "flame" },
  { name: "Distinguished Engineer", minXP: 20000, color: "#06b6d4", icon: "diamond" },
  { name: "Codyza Fellow", minXP: 35000, color: "#ffd700", icon: "star" },
]

export function getRankFromXP(xp: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i]
  }
  return RANKS[0]
}

export function getNextRank(xp: number) {
  for (let i = 0; i < RANKS.length; i++) {
    if (xp < RANKS[i].minXP) return RANKS[i]
  }
  return null
}
