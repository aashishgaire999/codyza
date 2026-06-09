import { Metadata } from "next";
import Link from "next/link";
import { SmartNavbar } from "@/components/shared/smart-navbar"
import { ParticleField } from "@/components/effects/particle-field"
import { GlowOrb } from "@/components/effects/glow-orb";
import { createClient } from "@/lib/supabase";
import { ArrowLeft, Trophy, TrendingUp, Zap, Crown, Award, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Leaderboard | Codyza",
  description: "Top contributors ranked by XP and achievements",
};

interface Contributor {
  codyza_id: string;
  name: string;
  github: string;
  xp: number;
  rank: string;
  streak: number;
  role: string;
  avatar_url?: string;
}

// Professional rank badges with gradient designs
const RANK_SYSTEM = {
  "Apprentice": {
    gradient: "from-slate-600 to-slate-400",
    glow: "shadow-slate-500/50",
    border: "border-slate-500/30",
    minXP: 0,
    badge: "I"
  },
  "Associate Engineer": {
    gradient: "from-emerald-600 to-emerald-400",
    glow: "shadow-emerald-500/50",
    border: "border-emerald-500/30",
    minXP: 500,
    badge: "II"
  },
  "Software Engineer": {
    gradient: "from-blue-600 to-blue-400",
    glow: "shadow-blue-500/50",
    border: "border-blue-500/30",
    minXP: 1500,
    badge: "III"
  },
  "Senior Engineer": {
    gradient: "from-purple-600 to-purple-400",
    glow: "shadow-purple-500/50",
    border: "border-purple-500/30",
    minXP: 3500,
    badge: "IV"
  },
  "Staff Engineer": {
    gradient: "from-amber-600 to-amber-400",
    glow: "shadow-amber-500/50",
    border: "border-amber-500/30",
    minXP: 7000,
    badge: "V"
  },
  "Principal Engineer": {
    gradient: "from-red-600 to-red-400",
    glow: "shadow-red-500/50",
    border: "border-red-500/30",
    minXP: 12000,
    badge: "VI"
  },
  "Distinguished Engineer": {
    gradient: "from-cyan-600 to-cyan-400",
    glow: "shadow-cyan-500/50",
    border: "border-cyan-500/30",
    minXP: 20000,
    badge: "VII"
  },
  "Codyza Fellow": {
    gradient: "from-yellow-600 via-yellow-400 to-yellow-200",
    glow: "shadow-yellow-500/60",
    border: "border-yellow-500/40",
    minXP: 35000,
    badge: "VIII"
  },
};

async function getLeaderboard(): Promise<Contributor[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contributors")
    .select("codyza_id, name, github, xp, rank, streak, role, avatar_url")
    .order("xp", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }

  return data || [];
}

export default async function LeaderboardPage() {
  const contributors = await getLeaderboard();

  return (
    <div className="min-h-screen text-white bg-background">
      <SmartNavbar />
      <ParticleField />
      <GlowOrb color="purple" size={700} className="-top-40 -left-20" duration={20} />
      <GlowOrb color="cyan" size={500} className="bottom-0 right-0" duration={16} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Elite Contributors
          </h1>
          <p className="text-gray-400 text-lg">
            Ranked by experience points, contribution impact, and consistency
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,92,246,0.15)"}}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-400 text-sm font-medium">Active Contributors</span>
              </div>
              <p className="text-4xl font-bold">{contributors.length}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(59,130,246,0.15)"}}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm font-medium">Total Experience</span>
              </div>
              <p className="text-4xl font-bold">
                {contributors.reduce((sum, c) => sum + c.xp, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(245,158,11,0.15)"}}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-gray-400 text-sm font-medium">Highest Rank</span>
              </div>
              <p className="text-2xl font-bold truncate">{contributors[0]?.rank || "None Yet"}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Grid */}
        <div className="space-y-4">
          {contributors.map((contributor, index) => {
            const rankConfig = RANK_SYSTEM[contributor.rank as keyof typeof RANK_SYSTEM];
            const position = index + 1;
            const isTopThree = position <= 3;

            return (
              <Link
                key={contributor.codyza_id}
                href={`/contributor/${contributor.codyza_id.toLowerCase()}`}
                className="block group relative overflow-hidden rounded-2xl backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
                style={{background:isTopThree?"rgba(245,158,11,0.05)":"rgba(255,255,255,0.02)",border:isTopThree?"1px solid rgba(245,158,11,0.2)":"1px solid rgba(255,255,255,0.06)"}}
              >
                {/* Top 3 Highlight Glow */}
                {isTopThree && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" style={{background:"rgba(139,92,246,0.04)"}} />
                )}

                <div className="relative p-6">
                  <div className="flex items-center gap-6">
                    {/* Position Number */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                        style={{background:position===1?"linear-gradient(135deg,#f59e0b,#d97706)":position===2?"linear-gradient(135deg,#9ca3af,#6b7280)":position===3?"linear-gradient(135deg,#d97706,#c2410c)":"rgba(255,255,255,0.1)",color:position>3?"#9ca3af":"white"}}>
                        {position}
                      </div>
                    </div>

                    {/* Contributor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden" style={{border:"2px solid rgba(139,92,246,0.2)"}}>
                          {contributor.avatar_url
                            ? <img src={contributor.avatar_url.split("?")[0] + "?t=" + Date.now()} alt={contributor.name} className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{background:"linear-gradient(135deg,#8b5cf6,#3b82f6)"}}>{contributor.name.charAt(0).toUpperCase()}</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold truncate group-hover:text-purple-400 transition-colors">
                            {contributor.name}
                          </h3>
                          <p className="text-sm text-gray-400">{contributor.codyza_id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`relative px-4 py-2 rounded-xl bg-gradient-to-r ${rankConfig?.gradient} ${rankConfig?.glow} shadow-lg border ${rankConfig?.border}`}>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span className="font-bold text-sm">{rankConfig?.badge}</span>
                        </div>
                        <p className="text-xs mt-1 opacity-90">{contributor.rank}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">
                          {contributor.xp.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-400">
                          {contributor.streak}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Streak</p>
                      </div>
                      <div className="text-center min-w-[120px]">
                        <p className="text-sm font-semibold text-gray-300 truncate">
                          {contributor.role}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="lg:hidden mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-yellow-400">{contributor.xp.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 uppercase">XP</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-orange-400">{contributor.streak}</p>
                      <p className="text-xs text-gray-500 uppercase">Streak</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-300 truncate">{contributor.role}</p>
                      <p className="text-xs text-gray-500 uppercase">Role</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {contributors.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No contributors yet. Be the first to climb the ranks!</p>
          </div>
        )}
      </div>
    </div>
  );
}
