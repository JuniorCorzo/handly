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

Edit `app/page.tsx` — auto-reload on save.

## Design

Owner file: `DESIGN.md` (Stitch/Figma-ready). Canonical tokens: OKLCH Restrained teal `#0F5C59` ≤10%. Light-first high-contrast, proven dark mode. See `openspec/changes/handly-personality-foundation/design.md`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
