---
name: Handly
description: Donation coordination in emergencies — donor-first pledge flow (guest), calm operational UI.
colors:
  background: "#F6FAF8"
  surface: "#FFFFFF"
  ink: "#13201C"
  muted: "#52635D"
  border: "#CBD8D2"
  primary: "#0F5C59"
  focus: "#1D4ED8"
  critical: "#B42318"
  urgent: "#A14B00"
  standard: "#1D5F74"
  success: "#176B45"
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

> **Owner file for Google Stitch / Figma / v0.** Copy-paste ready. Canonical tokens are OKLCH (see Colors); hex in frontmatter is the Stitch-parsable sRGB approximation. Repository is `handly` (renamed from `coderhub` in Phase 1). Canonical light background is `oklch(0.9815 0.005 165)` / `#F6FAF8` (teal-tinted, not warm sand); dark set preserves hue with shifted lightness (see §2 and Appendix). Restrained teal ≤10% of viewport; cream/sand band (OKLCH L 0.84–0.97 C<0.06 hue 40–100) forbidden as body. WCAG AA verified (see Appendix).

## 1. Overview

**Creative North Star: "The Calm Instruction Sheet"**

Handly is donation coordination in emergencies. The interface must read like a clear, hospital-calm instruction sheet taped to a wall — not a campaign landing page, not a gamer dashboard, not a data cockpit. Primary user: a guest donor on a phone in daylight, possibly stressed, one-handed, scanning what is needed now and how to help today. The system earns trust by being quiet, precise, and never louder than the situation.

Aesthetic philosophy: **Linear / Notion minimal, airy, type-perfect.** Restrained color strategy (tinted neutrals + teal ≤10%), single type family (Geist), generous whitespace, few large cards, no decoration tax. Operational serenity is the voice; restraint is the palette. Motion and elevation are state cues, not theatre. Every urgent signal is redundant (badge + icon + order) so comprehension never depends on color alone.

What this system explicitly rejects: warm cream/sand AI-default backgrounds, gradient text, glassmorphism, side-stripe borders, hero-metric clichés, identical tiny-card grids, uppercase eyebrows on every section, sketchy SVG illustrations, and any urgency styling that is color-only.

**Key Characteristics:**
- Operativa serena: calm under pressure, direct, hospitable, never panicked
- Restrained OKLCH palette — teal accent disciplines the page
- Airy catalog — few large need cards, generous whitespace, mobile-first
- Single-family typography (Geist) with fixed product scale
- Light-first, dark-proven; WCAG AA everywhere, non-color urgency cues
- Wordmark-only brand (typographic Handly in Geist, no isotipo for MVP)

## 2. Colors

Restrained strategy: tinted neutrals carry the surface; teal carries action. Warm-neutral cream band (OKLCH L 0.84–0.97, C < 0.06, hue 40–100) is forbidden as body.

### Primary

- **Institutional Teal** (`oklch(0.431 0.07 191)` / `#0F5C59`): primary actions, links, selection, focus-adjacent. ≤10% of any viewport. Contrast 7.79:1 on white (AA). Use for CTA fill, active tab, selected state only — never as page wash.

### Neutral

- **Paper** (`oklch(0.982 0.005 165)` / `#F6FAF8`): page background. Teal-tinted neutral (chroma 0.005 toward teal), not warm sand. Ink on Paper 15.95:1.
- **Surface** (`oklch(1 0 0)` / `#FFFFFF`): cards, dialogs, inputs. Elevation via tinted shadow, not border+blur ghost-card.
- **Ink** (`oklch(0.23 0.02 173)` / `#13201C`): body text. Primary reading color.
- **Muted** (`oklch(0.484 0.023 172)` / `#52635D`): secondary text, captions. 6.04:1 on Paper (AA for body).
- **Border** (`oklch(0.871 0.016 167)` / `#CBD8D2`): dividers, field strokes. Teal-tinted, not warm grey.
- **Focus Blue** (`oklch(0.488 0.217 264)` / `#1D4ED8`): 2px focus ring + 2px offset. Always visible on keyboard nav.

### Semantic Urgency Roles (non-color redundancy required)

- **Critical** (`oklch(0.50 0.182 30)` / `#B42318`): most urgent needs. Badge + icon + top sort position. 6.57:1 on white.
- **Urgent** (`oklch(0.514 0.134 51)` / `#A14B00`): elevated needs. Badge + icon + middle position. 5.96:1 on white.
- **Standard** (`oklch(0.454 0.073 223)` / `#1D5F74`): routine needs. Badge + icon + lower position. 7.14:1 on white.
- **Success** (`oklch(0.469 0.099 158)` / `#176B45`): fulfilled/received. 6.51:1 on white.

Each urgency level is identified by three concurrent cues: badge label, icon, and sort order. Color reinforces; it never decides alone.

### Dark Mode (proven, not afterthought)

Same hues, lightness-shifted to preserve hierarchy and AA:

- Background `oklch(0.18 0.015 191)`, Surface `oklch(0.22 0.015 191)`, Ink `oklch(0.95 0.005 165)`, Muted `oklch(0.70 0.02 172)`, Border `oklch(0.30 0.02 191)`. Accent/semantic hues held at adjusted L. Respect `prefers-color-scheme`; add manual toggle if brand needs it. No pure `#000`/`#FFF`.

### Named Rules

**The Restrained Rule.** Teal appears on ≤10% of any screen — actions and selection only. If the page looks teal, it is wrong.
**The Non-Color Urgency Rule.** No urgency state may be conveyed by color alone. Badge + icon + order are mandatory.
**The No-Cream Rule.** The body background is a teal-tinted neutral. The saturated warm cream/sand band is forbidden.

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

**The One-Family Rule.** Geist carries headings, body, labels, and UI. No second display face.
**The Balance Rule.** `text-wrap: balance` on h1–h3; `text-wrap: pretty` on prose; body never exceeds 75ch.

## 4. Elevation

Flat by default; elevation conveys state, not decoration. Tinted shadows (hue follows ink), not pure black drops.

### Shadow Vocabulary

- **Level 0 — Flat** (`none`): resting cards, page background. Depth via border or whitespace, not shadow.
- **Level 1 — Lifted** (`0 1px 3px oklch(0.23 0.02 173 / 0.08)`): hovered card, raised control.
- **Level 2 — Floating** (`0 4px 12px oklch(0.23 0.02 173 / 0.10)`): dialog, popover, toast.

Borders and shadows are alternatives — never `1px solid + blur ≥16px` ghost-card on the same element. Radius scale: controls 8px, cards 12px, tags/pills full. Mixed radii without a documented rule are forbidden.

### Named Rules

**The State-Only Elevation Rule.** Shadows appear only as a response to state (hover, open, focus). Rest is flat.

## 5. Components

One icon family, one shape scale, one density system per page. All interactive components specify default / hover / focus / active / disabled / loading / error — no half-states.

### Buttons

- **Shape:** 8px radius, `10px 20px` padding. One shape everywhere.
- **Primary:** Teal fill (`primary`) on white text. Hover: subtle darken (filter/opacity), not a new hue. Focus: 2px `focus` ring + 2px offset. Active: `translateY(1px)` or `scale(0.98)`. Label max 2–3 words, single line at desktop — wrapping CTA is a failure.
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

- **Do** use OKLCH tokens and keep teal ≤10% — restraint is the brand.
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
- **Don't** ship color-only urgency, pure `#000`/`#FFF`, Inter as default sans, or mixed accent hues on one page — lock teal and audit every component.

---

## Appendix — Tokens for Stitch Variables (exportable)

| Token | OKLCH | sRGB | Role |
|---|---|---|---|
| `background` | `oklch(0.9815 0.005 165)` | `#F6FAF8` | Page — light canonical (matches `design.md`). Dark: `oklch(0.18 0.015 191)` |
| `surface` | `oklch(1 0 0)` | `#FFFFFF` | Card/dialog/input — Dark: `oklch(0.22 0.015 191)` |
| `ink` | `oklch(0.23 0.02 173)` | `#13201C` | Text — Dark: `oklch(0.95 0.005 165)` |
| `muted` | `oklch(0.4835 0.023 172)` | `#52635D` | Secondary text — Dark: `oklch(0.70 0.02 172)` |
| `border` | `oklch(0.871 0.016 167)` | `#CBD8D2` | Dividers — Dark: `oklch(0.30 0.02 191)` |
| `primary` | `oklch(0.431 0.07 191)` | `#0F5C59` | Action (Restrained ≤10%) — Dark: `oklch(0.72 0.08 191)` |
| `focus` | `oklch(0.488 0.217 264)` | `#1D4ED8` | Focus ring 2px+2px offset — Dark: `oklch(0.74 0.16 264)` |
| `critical` | `oklch(0.50 0.182 30)` | `#B42318` | Critical — Dark: `oklch(0.70 0.14 30)` |
| `urgent` | `oklch(0.514 0.134 51)` | `#A14B00` | Urgent — Dark: `oklch(0.75 0.11 51)` |
| `standard` | `oklch(0.454 0.073 223)` | `#1D5F74` | Standard — Dark: `oklch(0.70 0.10 223)` |
| `success` | `oklch(0.469 0.099 158)` | `#176B45` | Success — Dark: `oklch(0.72 0.11 158)` |

Canonical source: `openspec/changes/handly-personality-foundation/design.md` Color table (light+dark). Frontmatter hex is Stitch-parsable approximation; OKLCH in this table is canonical. Rules: **Restrained** (teal ≤10% per viewport), **No-Cream** (body forbids OKLCH L 0.84–0.97 C<0.06 hue 40–100), bans: side-stripe `border-left>1px`, gradient text, glassmorphism, `border+blur≥16px` ghost-card, `32px+` card radius.

WCAG AA notes: ink 15.95:1 on background, muted 6.04:1 on background, action 7.79:1 on white / 6.70:1 focus on white, critical 6.57:1 / urgent 5.96:1 / standard 7.14:1 / success 6.51:1 on white (body ≥4.5:1, large ≥3:1 satisfied). Dark mode holds same hierarchy at shifted lightness. Placeholder contrast = body contrast (never muted-grey-on-white).

**Foundation scope — explicitly excluded:** final logo artwork, `app/page.tsx` UI, DB migrations/RLS/Auth, pledge/TTL/SOS runtime, AI prompts/models, Resend templates, Make blueprint edits/deploys, offline/maps/SMS, analytics, IA prompts. This file is foundation only.
