<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`codyza` is a single Next.js 16 app (App Router, Turbopack) — a dark-themed developer-community
landing site plus member/admin portal backed by Supabase (data), Google Gemini (AI project
review), and Resend (email). It is the only service. Node 22, package manager is **npm**
(`package-lock.json`). Standard commands live in `package.json`: `npm run dev` (port 3000),
`npm run lint`, `npm run build`.

Non-obvious caveats:

- **The app cannot boot without env vars present.** `src/lib/supabase.ts` constructs the Supabase
  client at module import time, so a missing `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  makes *every* page return HTTP 500. A gitignored `.env.local` with well-formed **placeholder**
  values is kept in the VM so the dev server and public pages boot. Real Supabase/Gemini/Resend
  credentials are required for actual data reads/writes, AI review, email, and admin flows. If
  `.env.local` is missing, recreate it with these keys: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `RESEND_API_KEY`,
  `ADMIN_ACCESS_CODE`.
- `npm run lint` currently reports pre-existing errors/warnings from the app code; the linter
  itself works. `npm run build` succeeds and does not fail on those lint issues.
- Known pre-existing (non-env) bug: the `/apply` form step 2 crashes with an "Invalid src prop …
  hostname avatars.githubusercontent.com is not configured" error because that host is missing
  from `images` in `next.config.ts`. This is a code bug, not an environment problem.
- `@clerk/nextjs` is a dependency but is not wired into the app; auth-related pages use Supabase.
