# Handly

Donation coordination in emergencies — donor-first pledge flow (guest), calm operational UI.

> Product: **Handly**. Repository: `handly` (previously `coderhub`). Guest donor browses needs, pledges quantity, receives `SOS-XXXX` without auth.

## Stack

Next.js 16 (App Router + Server Actions) · React 19 · Tailwind CSS 4 · TypeScript 5 (strict) · pnpm

Typography: Geist via `next/font` — literal names in `@theme inline`, no Arial, variables on `<html>`.

## Getting Started

```bash
pnpm install # auto-instala hooks lefthook
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the required values (a missing variable throws at startup):

| Variable | Description | Example |
| --- | --- | --- |
| `SUPABASE_URL` | URL of your Supabase project's API | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase project anon (public) key | `eyJhbGciOiJ...` |
| `SITE_URL` | Base URL of the site (used for auth callbacks) | `http://localhost:3000` |

Find the Supabase values at: <https://supabase.com/dashboard/project/_/settings/api>

> All three are validated server-side in `lib/env.ts`. `SITE_URL` is used by Supabase auth redirects, so it must match the URL the browser reaches.

Edit `app/page.tsx` — auto-reload on save.

## Calidad (Ultracite + Oxlint/Oxfmt) — para todos, técnico o no

Hooks corren solos tras `pnpm install` (`prepare` → `lefthook install`).

- Commit: `npx ultracite fix` sobre staged (auto-fix + `stage_fixed`).
- Push: `npx ultracite check` + `pnpm tsc --noEmit` (bloquea si hay errores).
- Si te bloqueó: corre `pnpm lint` (muestra), `pnpm format` (arregla), commit de nuevo.
- Formato: `npx oxfmt --check .` debe dar 0 (ya 0 en `main`).
- Todo el check manual: `pnpm ultracite:check && pnpm tsc --noEmit && pnpm build`.

## Design

Owner file: `DESIGN.md` (Stitch/Figma-ready). Canonical tokens: OKLCH institutional `#2563EB` (slate `#F8FAFC` / `#0F172A`). Light-first high-contrast, proven dark mode. See `openspec/changes/handly-personality-foundation/design.md`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
