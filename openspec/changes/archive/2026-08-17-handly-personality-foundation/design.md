# Design: Handly Personality Foundation

Handly: public product; repository `handly` (renamed from `coderhub` in Phase 1). UI is **operativa serena** — calm under pressure, direct, hospitable, never panicked.

## Identity, Audiences, and Voice

| Audience / job | Boundary |
|---|---|
| Guest donor (primary) | Browse needs, distinguish urgency at a glance, pledge quantity, receive `SOS-XXXX`, then see exact collection address. Guest, no account. |
| Organization operator | Curate needs, review AI proposals, publish status, monitor progress. Authenticated/authorized. |
| Collection worker | Look up `SOS-XXXX`, record partial/full receipt. Exact location is operational only. |

**Voice: operativa serena.** Calm is operational, not soft. Direct, respectful, action-first, low anxiety. In emergencies: urgent, never panicked, never guilt-based, never guaranteed, never unverified. `AI proposes, a human confirms` is behavior, not slogan. Neutral Spanish via `locale`; name need, quantity, unit, zone, deadline, action. Never expose exact addresses publicly or present AI output as confirmed.

- Do: `Urgente: se necesitan 20 botiquines. Confirmado por la organización.` / `La IA propone. Una persona confirma.`
- Don't: `¡Ayuda urgente! Sin tu donación no llegamos` (guilt/panic) / `Confirmado por IA` (unverified).

**State copy (neutral `es`, via `locale`):**

| State | Copy |
|---|---|
| loading | `Cargando necesidades activas…` |
| empty | `No hay necesidades activas en esta zona.` |
| error | `No pudimos guardar la reserva. Revisa los datos e intenta de nuevo.` |
| success | `Reserva confirmada. Guarda tu código SOS-7X9K.` |
| expired | `La reserva venció y el cupo volvió a estar disponible.` |
| cancelled (future) | `La reserva fue cancelada. El código ya no está activo.` |
| partial | `Recibimos 3 de 5 unidades. La necesidad sigue abierta por 2.` |

Physical scene: a guest donor on a phone in daylight, outdoors or at a collection point, scanning what is needed now. Bright ambient light, possible stress, one-handed use. The interface must feel like a clear instruction sheet, not a dashboard or campaign page.

## Design Foundation and Runtime

**Strategy: Restrained.** Tinted neutrals + one accent ≤10% of surface. Teal carries action and wayfinding only; neutrals carry the page. The `creamy/sand` warm-neutral band (`oklch` L 0.84–0.97, C < 0.06, hue 40–100) is forbidden as body background.

**Color — OKLCH, light-first high-contrast (WCAG AA verified):**

> All tokens in OKLCH. Light is canonical; dark preserves hue and contrast hierarchy.

| Role | OKLCH | sRGB approx | Usage | Contrast |
|---|---|---|---|---|
| `background` | `oklch(0.9815 0.005 165)` | `#F6FAF8` | Page background — tinted neutral (teal 0.005), not warm sand | ink 15.95:1 ✓ |
| `surface` | `oklch(1 0 0)` | `#FFFFFF` | Cards, dialogs | ink 15.95:1 on background |
| `ink` | `oklch(0.23 0.02 173)` | `#13201C` | Body text | 15.95:1 on background ✓ |
| `muted` | `oklch(0.4835 0.023 172)` | `#52635D` | Secondary text, captions | 6.04:1 on background ✓ |
| `border` | `oklch(0.871 0.016 167)` | `#CBD8D2` | Borders, dividers, field strokes | — |
| `action` | `oklch(0.431 0.07 191)` | `#0F5C59` | Primary actions, links, selection — seed teal | 7.79:1 on white ✓ |
| `focus` | `oklch(0.488 0.217 264)` | `#1D4ED8` | Focus ring (2px, offset 2px) | 6.70:1 on white ✓ |
| `critical` | `oklch(0.50 0.182 30)` | `#B42318` | Critical need role | 6.57:1 on white ✓ |
| `urgent` | `oklch(0.514 0.134 51)` | `#A14B00` | Urgent need role | 5.96:1 on white ✓ |
| `standard` | `oklch(0.454 0.073 223)` | `#1D5F74` | Standard need role | 7.14:1 on white ✓ |
| `success` | `oklch(0.469 0.099 158)` | `#176B45` | Fulfilled / received | 6.51:1 on white ✓ |

Body ≥4.5:1, large (≥18px or bold ≥14px) ≥3:1, placeholder same as body. Critical/urgent/standard roles never rely on color alone — each need carries **badge + icon + sort order**; color reinforces, it does not decide.

**Dark mode (tested, not afterthought):** `background` `oklch(0.18 0.015 191)`, `surface` `oklch(0.22 0.015 191)`, `ink` `oklch(0.95 0.005 165)`, `muted` `oklch(0.70 0.02 172)`, `border` `oklch(0.30 0.02 191)`, same accent/semantic hues at adjusted lightness to hold ≥4.5:1. Hierarchy preserved; accent remains ≤10%.

**Typography: Geist only.** One family, weights 400/500/600/700, `next/font`, variables on `<html>`, literal names in `@theme inline` (no `var(--font-geist-sans)` inside `@theme inline`, no Arial). Fixed product scale, not fluid `clamp()`: `12/14/16/18/24/32/40`. Ratio 1.125–1.2. `text-wrap: balance` on h1–h3, `text-wrap: pretty` on prose, cap prose at 65–75ch, letter-spacing ≥ -0.04em on display.

**Spacing / layout:** 4px base unit. Breakpoints 640/768/1024/1280. Grids use `repeat(auto-fit, minmax(280px, 1fr))` — no flex-percentage math. Content max ~1400px / `max-w-7xl` centered. Catalog density: **Aireado** — few large need cards, generous whitespace, Linear/Notion reference (minimal, airy, perfect type, not dense cockpit). Mobile-first, 44px touch targets.

**Radius / elevation / motion / focus:**
- Radius: controls 8px, cards 12px, tags/pills full. One scale, no 32px+ cards.
- Elevation (tinted, 3 levels): `0` flat, `1` `0 1px 3px oklch(0.23 0.02 173 / 0.08)`, `2` `0 4px 12px oklch(0.23 0.02 173 / 0.10)` — never pair `1px border + blur ≥16px` ghost-card.
- Motion: transform/opacity only, `ease-out-quart` 150–250ms, intentional state change. `prefers-reduced-motion: reduce` → crossfade/instant.
- Focus: 2px solid `focus`, 2px offset, always visible. Z-index scale: `dropdown(10) → sticky(20) → backdrop(30) → modal(40) → toast(50) → tooltip(60)`.

**Component / icon policy:** shadcn/ui selectively (form, dialog, alert, skeleton, badge) — not entire catalog; Tailwind 4 keeps `@import "tailwindcss"` and `@theme inline` tokens; Next 16 RSC: catalog/static shell is RSC, filters/pledge/realtime/dialogs are Client Components. Server mutations authenticate/authorize/validate. **Tabler Icons at 1.75px stroke, one family only** (Lucide rejected). Dependencies require need, direct imports, lockfile, boundary review.

**Absolute bans (impeccable):** no side-stripe `border-left >1px` accents on cards/alerts, no gradient text, no glassmorphism as default, no hero-metric template, no identical card grids, no tiny uppercase tracked eyebrow on every section, no numbered section markers as scaffolding, no `repeating-linear-gradient` stripes, no sketchy SVG illustrations. Nested cards are always wrong.

## Provider-Agnostic Boundaries and Gates

| Boundary | Contract and gate |
|---|---|
| DB | Repository plus real transaction/RPC; choose provider/RLS first. `FOR UPDATE` executes inside a transaction, not a diagram. Categories `Agua/Alimentos/Ropa/Salud/Abrigo + etc. (extensible)` — `etc.` open/versioned, not rigid ENUM. Zones curated/versioned; no hardcoded ENUM without governance. |
| Auth/guest | Membership boundary; define public scopes, guest identity, consent/retention, exact-address authorization. Public: zone/neighborhood; pledged donor: exact collection address. |
| AI | Structured proposal with confidence/provenance; gate threshold, human confirmation, fallback, retention. Never auto-publish. |
| Email | Versioned dispatcher/outbox; decide SLA, retry, dedupe, DLQ, audit, sender. Trigger: `GOAL_ACHIEVED` on pledge (`donation_goal_reached` v1) — not on receipt. |
| Realtime | Optional stream with polling fallback; prove need before choosing a provider. |

MVP: **expire-only**; pledge TTL 4/12/24h; reads/writes exclude expired pending rows; cancellation with `SOS-XXXX` is later. Language: `es` neutral with `locale` parameter. SOS generation is server-side, collision-retrying, rate-limited, non-enumerable.

## Make Integration Boundary

Updated blueprint replaces placeholders with hook `donation_webhook` (2703382), `event_type`/`recipient_email`/`data{org_name,campaign_name,item_goal,item_name,goal_reached,goal}`, sender `noreply@handly.angelcorzo.dev`, HTML, subject, and Resend connection 10488338. Defects preserved: `org_name` is prefixed six times (`{{2.data.org_name}}` ×6); filter reads `{{2.email_type}}` but interface declares `event_type`; HMAC, schema validation, idempotency/deduplication, text-version, DLQ, and delivery guarantees are absent. Unknown routing is unsafe. Do not silently repair JSON.

Contract, emitted after the pledge commit reaches its goal:

```json
{"event_id":"uuid","event_type":"donation_goal_reached","version":1,"occurred_at":"timestamp","need_id":"uuid","organization_id":"uuid","recipient_email":"email","locale":"es","dedupe_key":"stable","data":{}}
```

Route Handler validates schema, email/locale, timestamp/replay, and HMAC (`X-Handly-Signature`); idempotently deduplicates by `dedupe_key`/`event_id`. Adapter maps v1 to legacy `GOAL_ACHIEVED`; no name mixing. Application owns emission/secret/schema; Make owns routing/Resend/retry-DLQ. Flow: pledge → event → signed ingress → validation/dedupe → Make → email. Rollout: fixtures, shadow, deduplicated cutover, retirement. Guaranteed email remains a gate.

## Architecture Decisions, Threats, Tests

| Decision | Alternative; reason |
|---|---|
| Handly/donor-first/**operativa serena** + Linear/Notion aireado + Geist solo | Triage SOS/community-warm/verbal-overflow; calm operational language keeps urgency readable under stress without panic. |
| Light-first Restrained (OKLCH teal) / expire-only / wordmark-only | Dark-first/Committed/drench/isotipo; daylight field safety, smaller MVP, accent discipline. |
| Provider-neutral/Make external | Supabase/email-in-app; no lock-in, retain delivery boundary. |
| Tabler 1.75px / selective shadcn | Lucide/all UI; one owned vocabulary, less drift. |

Risks: provider/RLS, races, TTL, SOS enumeration, guest privacy, AI, email. Make repair remains rejected.

| Threat boundary | Status / safe failure / planned RED |
|---|---|
| Documentation-like paths; Git selection; commit; push; PR commands | N/A: no executable classification or VCS/PR automation. |
| Make process/webhook routing | Applicable: reject unsigned, malformed, replayed, unknown, or duplicate events; transient failures retry and DLQ. RED: one contract test per case plus legacy `event_type` mismatch. |

Tests unavailable. Add contract/accessibility tests with approval; checks are lint, strict TypeScript, build, two-theme/keyboard/a11y review (WCAG AA), and 5/5 donor mocks under two minutes distinguishing critical/urgent/standard without color.

## Files and Gates

| File | Action |
|---|---|
| `app/layout.tsx` | Handly metadata, `lang="es"`, Geist variables on `<html>`, literal `@theme inline` names. |
| `app/globals.css` | Semantic OKLCH tokens (light+dark), remove Arial, Restrained strategy. |
| `DESIGN.md` | New: owner file for Stitch/Figma/v0 (foundation only). |
| `openspec/config.yaml` | Mark docs as hypotheses (proposal not canonical). |
| `package.json` | Approved UI/icon dependencies only (Tabler, selective shadcn). |
| `Donation Email Dispatch.blueprint.json` | External; never silently edited — 6× org_name + event_type mismatch recorded. |

Spec gates: provider/RLS/transaction owner, recipient/email SLA, guest retention, AI confidence, and TTL/SOS ownership. Bans are gates: side-stripe, gradient text, glassmorphism, hero-metric, identical grids all fail review.
