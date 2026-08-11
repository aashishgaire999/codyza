# Codyza deployment checklist

## 1. Database

Run `supabase/codyza-platform.sql` once in the production Supabase SQL editor. It is idempotent and creates the editable content, media, news, comments, announcements, clock-in tables, indexes, storage bucket, and read policies.

Then run:

```bash
npm run check:release
```

## 2. Hosting environment

Add every variable from `.env.example` to the production hosting project. Keep `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ACCESS_CODE`, `RESEND_API_KEY`, and `GEMINI_API_KEY` server-only. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin, without a trailing slash.

## 3. Supabase authentication

In Authentication → URL Configuration:

- Site URL: `https://codyza.com`
- Redirect URL: `https://codyza.com/auth/callback`
- Keep the localhost callback only for development.

## 4. Release gate

```bash
npm run check:release
npm run test
npm run build
```

After deployment, smoke-test member login, admin login, member clock-in/out, admin media upload, news publishing, and member comments.
