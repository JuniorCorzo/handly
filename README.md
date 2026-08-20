# Handly

Donation coordination in emergencies — donor-first pledge flow (guest), calm operational UI.

> Product: **Handly**. Repository: `handly` (previously `coderhub`). Guest donor browses needs, pledges quantity, receives `SOS-XXXX` without auth.

## Stack

Next.js 16 (App Router + Server Actions) · React 19 · Tailwind CSS 4 · TypeScript 5 (strict) · pnpm

Typography: Geist via `next/font` — literal names in `@theme inline`, no Arial, variables on `<html>`.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the required values (a missing variable throws at startup):

| Variable          | Description                                                        | Example                        |
| ----------------- | ------------------------------------------------------------------ | ------------------------------ |
| `SUPABASE_URL`    | URL of your Supabase project's API                                 | `https://xyz.supabase.co`      |
| `SUPABASE_ANON_KEY` | Supabase project anon (public) key                               | `eyJhbGciOiJ...`               |
| `SITE_URL`        | Base URL of the site (used for auth callbacks)                     | `http://localhost:3000`        |

Find the Supabase values at: <https://supabase.com/dashboard/project/_/settings/api>

> All three are validated server-side in `lib/env.ts`. `SITE_URL` is used by Supabase auth redirects, so it must match the URL the browser reaches.

Edit `app/page.tsx` — auto-reload on save.

## Design

Owner file: `DESIGN.md` (Stitch/Figma-ready). Canonical tokens: OKLCH Restrained teal `#0F5C59` ≤10%. Light-first high-contrast, proven dark mode. See `openspec/changes/handly-personality-foundation/design.md`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
