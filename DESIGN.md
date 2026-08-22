---
name: Handly
description: Donation coordination in emergencies — donor-first pledge flow (guest), calm operational UI.
colors:
  # Nuevos institucionales (light hex; dark en §2 Appendix)
  bgMain: "#F8FAFC"
  bgSurface: "#FFFFFF"
  borderColor: "#E2E8F0"
  textPrimary: "#0F172A"
  textSecondary: "#475569"
  textMuted: "#64748B"
  primary: "#1E40AF"
  primaryHover: "#1D4ED8"
  primaryText: "#FFFFFF"
  accentSuccess: "#059669"
  statusCritical: "#DC2626"
  statusCriticalBg: "#FEF2F2"
  statusUrgent: "#D97706"
  statusUrgentBg: "#FFFBEB"
  # Aliases legacy (preservados sin cambios para compatibilidad)
  background: "#F8FAFC"
  surface: "#FFFFFF"
  ink: "#0F172A"
  muted: "#475569"
  border: "#E2E8F0"
  focus: "#1D4ED8"
  critical: "#DC2626"
  urgent: "#D97706"
  standard: "#334155"
  success: "#059669"
typography:
  display:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Geist Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  badge-critical:
    backgroundColor: "{colors.critical}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  badge-urgent:
    backgroundColor: "{colors.urgent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  badge-standard:
    backgroundColor: "{colors.standard}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  card-need:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: Handly

> **Owner file for Google Stitch / Figma / v0.** Copy-paste ready. Canonical tokens are OKLCH (see Colors); hex in frontmatter is the Stitch-parsable sRGB approximation. Repository is `handly` (renamed from `coderhub` in Phase 1). Canonical light background is `oklch(0.984 0.003 247.858)` / `#F8FAFC` (slate institutional); dark set preserves hue with shifted lightness (see §2 and Appendix). Institutional blue ≤10% of any viewport; cream/sand band (OKLCH L 0.84–0.97 C<0.06 hue 40–100) forbidden as body. WCAG AA verified (see Appendix).

## 1. Overview

**Creative North Star: "The Calm Instruction Sheet"**

Handly is donation coordination in emergencies. The interface must read like a clear, hospital-calm instruction sheet taped to a wall — not a campaign landing page, not a gamer dashboard, not a data cockpit. Primary user: a guest donor on a phone in daylight, possibly stressed, one-handed, scanning what is needed now and how to help today. The system earns trust by being quiet, precise, and never louder than the situation.

Aesthetic philosophy: **Linear / Notion minimal, airy, type-perfect.** Restrained color strategy (slate institutional + blue ≤10%), single type family (Geist), generous whitespace, few large cards, no decoration tax. Operational serenity is the voice; restraint is the palette. Motion and elevation are state cues, not theatre. Every urgent signal is redundant (badge + icon + order) so comprehension never depends on color alone.

What this system explicitly rejects: warm cream/sand AI-default backgrounds, gradient text, glassmorphism, side-stripe borders, hero-metric clichés, identical tiny-card grids, uppercase eyebrows on every section, sketchy SVG illustrations, and any urgency styling that is color-only.

**Key Characteristics:**

- Operativa serena: calm under pressure, direct, hospitable, never panicked
- Restrained OKLCH palette — institutional blue disciplines the page
- Airy catalog — few large need cards, generous whitespace, mobile-first
- Single-family typography (Geist) with fixed product scale
- Light-first, dark-proven; WCAG AA everywhere, non-color urgency cues
- Wordmark-only brand (typographic Handly in Geist, no isotipo for MVP)

## 2. Colors

Restrained strategy: slate institutional base with institutional blue accent. Warm-neutral cream band (OKLCH L 0.84–0.97, C < 0.06, hue 40–100) is forbidden as body.

### Primary

- **Institutional Blue Deep** (`#1E40AF` light / `#2563EB` dark): primary actions, links, selección. ≤10% viewport. Light es Blue 800 profundo, dark es Blue 600 luminoso sobre fondo oscuro. Hover light `#1D4ED8`, dark `#3B82F6`. Texto sobre primary `#FFFFFF`. Trust/corporativo.

### Neutral

- **Paper (slate-50)** (`#F8FAFC` ambos temas: light `bg-main` / dark `text-primary`): page background claro. Slate frío, no warm sand.
- **Surface** (`#FFFFFF` light / `#1E293B` dark `bg-surface`): cards, dialogs, inputs. En dark, superficie elevada `Slate 800`.
- **Ink (slate-900)** (`#0F172A` light `text-primary` / `#F8FAFC` dark): body text.
- **Muted (slate-600/400)** (`#475569` light `text-secondary` / `#94A3B8` dark): secondary text.
- **Muted extra** (`#64748B` ambos `text-muted`): etiquetas pequeñas Slate 500.
- **Border (slate-200/700)** (`#E2E8F0` light / `#334155` dark `border-color`): dividers 1px.
- **Focus/Hover Blue** (`#1D4ED8` light `primary-hover/focus` / `#3B82F6` dark): 2px focus ring + 2px offset.

### Semantic Urgency Roles (non-color redundancy required)

- **Critical** (`#DC2626` light / `#EF4444` dark `status-critical`): badge crítico. Light con fondo pastel `#FEF2F2` (`status-critical-bg`), dark con `#450A0A` — evita parche chillón, pastel + texto oscuro.
- **Urgent** (`#D97706` light / `#F59E0B` dark `status-urgent`): badge urgente. Fondos `#FFFBEB` light / `#451A03` dark (amber 600/500).
- **Standard** (`#334155` light / `#94A3B8` dark): preservado sin cambios — routine needs, low chroma.
- **Success** (`#059669` light `accent-success` / `#10B981` dark): emerald 600/500 para operativo completado.

Each urgency level is identified by three concurrent cues: badge label, icon, and sort order. Color reinforces; it never decides alone. Chromatic hierarchy: critical > urgent > success > standard.

### Dark Mode (proven, not afterthought) — Institutional Dark

Fondos `bg-main #0F172A` (Slate 900 noche), `bg-surface #1E293B` (Slate 800 elevado), `border-color #334155` (Slate 700), tipografía `text-primary #F8FAFC`, `text-secondary #94A3B8`, `text-muted #64748B`. Accent `primary #2563EB / hover #3B82F6 / text #FFFFFF`, `accent-success #10B981`, `status-critical #EF4444 / bg #450A0A`, `status-urgent #F59E0B / bg #451A03`, `standard #94A3B8` (preservado). Sin sombras en dark — solo diferencia bg-main vs bg-surface. Respect `prefers-color-scheme`. No pure `#000`/`#FFF`.

### Named Rules

**The Restrained Rule.** Institutional blue appears on ≤10% of any screen — actions and selection only. If the page looks blue, it is wrong. **The Non-Color Urgency Rule.** No urgency state may be conveyed by color alone. Badge + icon + order are mandatory. **The No-Cream Rule.** The body background is a slate institutional neutral. The saturated warm cream/sand band is forbidden.

## 3. Typography

**Display / Body / Label: Geist** (`Geist Fallback, ui-sans-serif, system-ui, sans-serif`) via `next/font`. Variables on `<html>`, literal names in `@theme inline` (never `var(--font-geist-sans)` inside `@theme inline`, never Arial). Mono only for `SOS-XXXX` and IDs: `Geist Mono`.

**Character:** quiet authority — one family, four weights, precise tracking. No display/body font pairing; the voice comes from weight and size contrast within Geist, not from mixing families.

### Hierarchy

- **Display** (700, 40px, 1.1, -0.02em): page hero / single focal headline. `text-wrap: balance`. Max 2 lines desktop.
- **Headline** (600, 32px, 1.2, -0.015em): section headings, need titles. `text-wrap: balance`.
- **Title** (600, 18px, 1.4): card titles, dialog titles, form section heads.
- **Body** (400, 16px, 1.6): prose, descriptions, list content. Cap at 65–75ch. `text-wrap: pretty` on long prose.
- **Label** (500, 14px, 1.4, 0.01em): buttons, form labels, badges, captions.
- **Mono** (400, 14px, 1.4): `SOS-XXXX`, codes, timestamps.

Scale steps: 12 / 14 / 16 / 18 / 24 / 32 / 40. Ratio 1.125–1.2. Fluid `clamp()` is forbidden for product UI; fixed rem scale. Display letter-spacing floor ≥ -0.04em.

### Named Rules

**The One-Family Rule.** Geist carries headings, body, labels, and UI. No second display face. **The Balance Rule.** `text-wrap: balance` on h1–h3; `text-wrap: pretty` on prose; body never exceeds 75ch.

## 4. Elevation

Flat by default; elevation conveys state, not decoration. Tinted shadows (hue follows ink), not pure black drops.

### Shadow Vocabulary

- **Level 0 — Flat** (`none`): resting cards, page background. Depth via border or whitespace, not shadow.
- **Level 1 — Lifted** (`0 1px 3px oklch(0.208 0.042 265.755 / 0.08)`): hovered card, raised control.
- **Level 2 — Floating** (`0 4px 12px oklch(0.208 0.042 265.755 / 0.10)`): dialog, popover, toast.

Borders and shadows are alternatives — never `1px solid + blur ≥16px` ghost-card on the same element. Radius scale: controls 8px, cards 12px, tags/pills full. Mixed radii without a documented rule are forbidden.

### Named Rules

**The State-Only Elevation Rule.** Shadows appear only as a response to state (hover, open, focus). Rest is flat.

## 5. Components

One icon family, one shape scale, one density system per page. All interactive components specify default / hover / focus / active / disabled / loading / error — no half-states.

### Buttons

- **Shape:** 8px radius, `10px 20px` padding. One shape everywhere.
- **Primary:** Institutional blue fill (`primary`) on white text. Hover: subtle darken (filter/opacity), not a new hue. Focus: 2px `focus` ring + 2px offset. Active: `translateY(1px)` or `scale(0.98)`. Label max 2–3 words, single line at desktop — wrapping CTA is a failure.
- **Secondary/Ghost:** white/border or transparent with ink text and 1px `border` stroke. Never low-contrast ghost over busy backgrounds without scrim.
- **States:** Disabled uses `muted` at 50% opacity, no accent. Loading uses skeleton/shimmer matching button shape, not a spinner floating in content. Contrast checked at AA. Duplicate intent CTAs on one page are forbidden (pick one label per intent).

### Need Card — Airy Variant

- **Corner:** 12px. **Background:** `surface` on `background` paper. **Border:** 1px `border`, no side-stripe. **Padding:** 20px internal. **Shadow:** none at rest, level 1 on hover.
- **Structure:** badge (pill, semantic fill, icon + label) → title → quantity/unit → zone (public) → deadline/TTL → progress → CTA. Sparse dividers only (`border-t` or `divide-y`), not nested cards. Each urgency level's badge+icon+sort-order redundancy is mandatory.
- **Grid:** `repeat(auto-fit, minmax(280px, 1fr))`, generous gap (24px). Few large cards — airy, not 6-up tiny grids. One layout family per section on a page; bento/category rhythm must not repeat the same image+text split more than twice in a row.
- **Public vs pledged:** public shows zone/neighborhood; pledged donor reveals exact collection address. Exact address never leaks before pledge.

### Pledge Dialog

- **Pattern:** shadcn `Dialog` → quantity input (label above, helper optional, error below, `gap-2` input block) → zone hint → confirm CTA → success with `SOS-XXXX` (mono). Use `AlertDialog` only for destructive confirmations. Placeholder is never a label. Focus trapped, dismissible, keyboard complete.

### SOS Badge

- **Style:** pill, mono `SOS-XXXX`, `surface` on `ink` or semantic tint at AA. Copy affordance, non-enumerable generation is product behavior (server-side collision-retry, rate-limited).

### Empty / Loading / Error States

- **Empty:** composed illustration slot (real asset or honest placeholder comment — no sketchy SVG) + one-line guidance + CTA. Never bare "nothing here."
- **Loading:** skeleton matching final layout shape (card skeleton, list skeleton). No centred spinner in content.
- **Error:** inline for forms (below input), contextual `Alert` or toast for transient. Error copy states what happened and how to fix, in operativa serena voice.

### Navigation

- **Frame:** top bar + optional side nav. Single line at desktop (collapse to hamburger if overflow). Height cap 80px, default 64–72px. Uses label typography, consistent active/hover states. Sticky/nav z-index per global scale.

### Do Not Propose

Nested cards, side-stripe `border-left >1px` urgency accents, gradient text, glassmorphism, hero-metric (big number + small label + gradient accent) — all banned. Cards are not the default grouping; prefer `border-t`/`divide-y`/whitespace when hierarchy does not require elevation.

## 6. Do's and Don'ts

### Do:

- **Do** use OKLCH tokens and keep institutional blue ≤10% — restraint is the brand.
- **Do** convey urgency with badge + icon + sort order; color is the third cue, never the first.
- **Do** use Geist only (400/500/600/700) with fixed scale 12/14/16/18/24/32/40, `text-wrap: balance/pretty`, 65–75ch prose.
- **Do** use 4px spacing, breakpoints 640/768/1024/1280, `auto-fit minmax(280px, 1fr)` grids, 44px targets, 8/12/pill radii.
- **Do** animate transform/opacity with `ease-out-quart` 150–250ms and provide `prefers-reduced-motion` crossfade/instant fallback.
- **Do** use semantic HTML, labels above inputs, live regions for pledge/expired state, 2px focus ring with 2px offset, test in both themes.
- **Do** use wordmark only — "Handly" in Geist, tracking -0.02em, no isotipo for MVP.
- **Do** use Tabler Icons at 1.75px stroke, one family everywhere, via direct imports; add shadcn/ui selectively (form/dialog/alert/skeleton/badge).

### Don't:

- **Don't** use warm cream/sand/paper body backgrounds (OKLCH L 0.84–0.97, C < 0.06, hue 40–100) or token names like `--paper/--cream/--sand`.
- **Don't** use side-stripe borders (`border-left >1px` colored accent) on cards, alerts, or list items — rewrite with full border, tint, or leading icon.
- **Don't** use gradient text (`background-clip: text` + gradient) or pair `1px border + blur ≥16px` ghost-card shadows.
- **Don't** use glassmorphism, hero-metric (big number / small label / gradient accent), identical card grids, or `repeating-linear-gradient` stripe backgrounds.
- **Don't** put a tiny uppercase tracked eyebrow above every section or numbered `01/02/03` markers as scaffolding.
- **Don't** use `32px+` radii on cards/sections/inputs (cards max 12–16px; pill only for tags/buttons).
- **Don't** invent `SOS-XXXX`, addresses, or urgency levels without server confirmation — "AI proposes, human confirms" is behavior.
- **Don't** ship color-only urgency, pure `#000`/`#FFF`, Inter as default sans, or mixed accent hues on one page — lock institutional blue and audit every component.

---

## Appendix — Tokens for Stitch Variables (exportable)

| Token | sRGB Light | sRGB Dark | CSS var | Role |
| --- | --- | --- | --- | --- |
| `bg-main` / `background` | `#F8FAFC` | `#0F172A` | `var(--bg-main)` / `var(--background)` | Page — Slate 50 / Slate 900 noche |
| `bg-surface` / `surface` | `#FFFFFF` | `#1E293B` | `var(--bg-surface)` | Card/dialog/input — White / Slate 800 elevado |
| `text-primary` / `ink` | `#0F172A` | `#F8FAFC` | `var(--text-primary)` | Text principal |
| `text-secondary` / `muted` | `#475569` | `#94A3B8` | `var(--text-secondary)` | Secondary text |
| `text-muted` | `#64748B` | `#64748B` | `var(--text-muted)` | Etiquetas pequeñas Slate 500 |
| `border-color` / `border` | `#E2E8F0` | `#334155` | `var(--border-color)` | Dividers 1px |
| `primary` | `#1E40AF` | `#2563EB` | `var(--primary)` | Institutional blue deep (light) / luminoso dark |
| `primary-hover` / `focus` | `#1D4ED8` | `#3B82F6` | `var(--primary-hover)` | Hover + focus ring 2px+2px offset |
| `primary-text` | `#FFFFFF` | `#FFFFFF` | `var(--primary-text)` | Texto sobre primary |
| `accent-success` / `success` | `#059669` | `#10B981` | `var(--accent-success)` | Emerald 600 / 500 |
| `status-critical` / `critical` | `#DC2626` | `#EF4444` | `var(--status-critical)` | Critical badge text — Red 600/500 |
| `status-critical-bg` | `#FEF2F2` | `#450A0A` | `var(--status-critical-bg)` | Fondo pastel critical (pulido, no parche chillón) |
| `status-urgent` / `urgent` | `#D97706` | `#F59E0B` | `var(--status-urgent)` | Urgent badge — Amber 600/500 |
| `status-urgent-bg` | `#FFFBEB` | `#451A03` | `var(--status-urgent-bg)` | Fondo pastel urgent |
| `standard` | `#334155` | `#94A3B8` | `var(--standard)` | Standard — **preservado sin cambios** |
| `shadow-card` | `0 1px 3px rgba(0,0,0,.05)` | `none` | `var(--shadow-card)` | Sombra sutil light, sin sombra dark |

Canonical source: `openspec/changes/handly-personality-foundation/design.md` Color table (light+dark). Frontmatter hex is Stitch-parsable approximation; OKLCH in this table is canonical. Rules: **Restrained** (blue ≤10% per viewport), **No-Cream** (body forbids OKLCH L 0.84–0.97 C<0.06 hue 40–100), bans: side-stripe `border-left>1px`, gradient text, glassmorphism, `border+blur≥16px` ghost-card, `32px+` card radius.

WCAG AA notes: institutional blue and semantic hues on white meet AA; dark mode holds same hierarchy at shifted lightness. Placeholder contrast = body contrast (never muted-grey-on-white).

**Foundation scope — explicitly excluded:** final logo artwork, `app/page.tsx` UI, DB migrations/RLS/Auth, pledge/TTL/SOS runtime, AI prompts/models, Resend templates, Make blueprint edits/deploys, offline/maps/SMS, analytics, IA prompts. This file is foundation only.
