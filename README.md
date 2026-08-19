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

Edit `app/page.tsx` — auto-reload on save.

## Calidad (Ultracite + Oxlint/Oxfmt) — para todos, técnico o no

Hooks corren solos tras `pnpm install` (`prepare` → `lefthook install`).

- Commit: `npx ultracite fix` sobre staged (auto-fix + `stage_fixed`).
- Push: `npx ultracite check` + `pnpm tsc --noEmit` (bloquea si hay errores).
- Si te bloqueó: corre `pnpm lint` (muestra), `pnpm format` (arregla), commit de nuevo.
- Formato: `npx oxfmt --check .` debe dar 0 (ya 0 en `main`).
- Todo el check manual: `pnpm ultracite:check && pnpm tsc --noEmit && pnpm build`.

## Design

Owner file: `DESIGN.md` (Stitch/Figma-ready). Canonical tokens: OKLCH Restrained teal `#0F5C59` ≤10%. Light-first high-contrast, proven dark mode. See `openspec/changes/handly-personality-foundation/design.md`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
