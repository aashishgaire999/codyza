import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { createClient } from "@/lib/supabase";
import { Trophy, TrendingUp, Zap, Crown, Award } from "lucide-react";

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

const RANK_SYSTEM: Record<string, { badge: string }> = {
  "Apprentice": { badge: "I" },
  "Associate Engineer": { badge: "II" },
  "Software Engineer": { badge: "III" },
  "Senior Engineer": { badge: "IV" },
  "Staff Engineer": { badge: "V" },
  "Principal Engineer": { badge: "VI" },
  "Distinguished Engineer": { badge: "VII" },
  "Codyza Fellow": { badge: "VIII" },
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-28 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            006 · leaderboard
          </p>
          <h1 className="headline-section font-[family-name:var(--font-heading)] lowercase">
            elite <span className="text-accent">contributors</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Ranked by experience points, contribution impact, and consistency
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="dashboard-stat">
            <div className="mb-3 flex items-center gap-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Active Contributors
              </span>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold">{contributors.length}</p>
          </div>

          <div className="dashboard-stat">
            <div className="mb-3 flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Total Experience
              </span>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-3xl font-bold">
              {contributors.reduce((sum, c) => sum + c.xp, 0).toLocaleString()}
            </p>
          </div>

          <div className="dashboard-stat">
            <div className="mb-3 flex items-center gap-3">
              <Crown className="h-4 w-4 text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Highest Rank
              </span>
            </div>
            <p className="font-[family-name:var(--font-heading)] text-xl font-bold truncate">
              {contributors[0]?.rank || "None Yet"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {contributors.map((contributor, index) => {
            const rankConfig = RANK_SYSTEM[contributor.rank as keyof typeof RANK_SYSTEM];
            const position = index + 1;
            const isTopThree = position <= 3;

            return (
              <Link
                key={contributor.codyza_id}
                href={`/contributor/${contributor.codyza_id.toLowerCase()}`}
                className={`surface-card group block p-6 transition-colors ${isTopThree ? "border-accent/30" : ""}`}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl font-[family-name:var(--font-heading)] text-xl font-bold ${
                        isTopThree
                          ? "bg-accent/10 text-accent"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {position}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border">
                        {contributor.avatar_url ? (
                          <img
                            src={contributor.avatar_url.split("?")[0] + "?t=" + Date.now()}
                            alt={contributor.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted font-bold text-foreground">
                            {contributor.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-[family-name:var(--font-heading)] text-lg font-semibold lowercase group-hover:text-accent transition-colors">
                          {contributor.name}
                        </h3>
                        <p className="font-mono text-[10px] text-muted-foreground">{contributor.codyza_id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="surface-card flex items-center gap-2 rounded-xl px-4 py-2">
                      <Award className="h-4 w-4 text-accent" />
                      <div>
                        <span className="font-mono text-xs font-bold">{rankConfig?.badge}</span>
                        <p className="font-mono text-[10px] text-muted-foreground">{contributor.rank}</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
                    <div className="text-center">
                      <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">
                        {contributor.xp.toLocaleString()}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">XP</p>
                    </div>
                    <div className="text-center">
                      <p className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">
                        {contributor.streak}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Streak</p>
                    </div>
                    <div className="min-w-[120px] text-center">
                      <p className="truncate text-sm font-medium text-foreground">{contributor.role}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Role</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-center lg:hidden">
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-bold">{contributor.xp.toLocaleString()}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">XP</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-lg font-bold">{contributor.streak}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Streak</p>
                  </div>
                  <div>
                    <p className="truncate text-sm font-medium">{contributor.role}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Role</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {contributors.length === 0 && (
          <div className="py-20 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No contributors yet. Be the first to climb the ranks!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
