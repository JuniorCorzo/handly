# Tasks: Handly Personality Foundation (coderhub → handly)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180–240 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | pending (single-pr, <800) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Rename + tokens + governance + verification | PR 1 → main | `pnpm lint && pnpm exec tsc --noEmit && pnpm build` | `pnpm dev` light/dark + 5/5 donor mocks <2min (badge+icon+order) | Revert `package.json`/`README.md`/`app/layout.tsx`/`app/globals.css`/`DESIGN.md`/`openspec/config.yaml`/moved change dir; restore `git remote -v` |

## Phase 1: Rename — coderhub → handly (must be first)

- [x] 1.1 Rename: `gh repo rename JuniorCorzo/coderhub → handly` + `git remote set-url`, update `package.json` name, `README.md` title, `app/layout.tsx` Handly title/desc `lang="es"` Geist vars on `<html>` (literal `@theme inline`), move `openspec/changes/coderhub-personality-foundation` → `handly-personality-foundation` + fix `openspec/specs/*` refs, set `openspec/config.yaml` `project: handly` remove canonical `docs/PROPUESTA_ARQUITECTURA.md` rule. Verify `git remote -v` + `pnpm lint && pnpm exec tsc --noEmit && pnpm build`. *Refs: proposal Intent, design Files/Gates, handly-identity Public identity.*

## Phase 2: Design Foundation — Tokens

- [x] 2.1 Rewrite `app/globals.css` to OKLCH tokens light+dark (WCAG AA ≥4.5:1/≥3:1, Restrained teal `#0F5C59` ≤10%, border `#CBD8D2`, focus `#1D4ED8` 2px+2px offset), remove Arial and `var(--font-geist-sans)` in `@theme inline`, forbid cream/sand and `border+blur≥16px` ghost-card. *Refs: design Foundation, DESIGN.md §2/Appendix, design-foundation Semantic tokens.*
- [x] 2.2 Enforce bans in `app/globals.css` + `DESIGN.md`: no `border-left>1px` side-stripe, no gradient text, no glassmorphism, no `32px+` card radius. *Refs: design-foundation Anti-slop bans.*

## Phase 3: Governance & Docs

- [x] 3.1 Fix `openspec/config.yaml` authority: mark `docs/PROPUESTA_ARQUITECTURA.md` hypothesis-only, keep `proposal/design/DESIGN.md` as source, preserve `artifact_store/delivery_strategy/review_budget_lines`. *Refs: proposal Success Criteria, platform-boundaries Provider-neutral.*
- [x] 3.2 Align `DESIGN.md` frontmatter + Appendix with `design.md` OKLCH table (light `0.9815 0.005 165`, dark set, contrast notes), add Restrained/No-Cream rules; keep Stitch-parsable. *Refs: design Color table, DESIGN.md §1–5.*

## Phase 4: Verification & Threat Boundary

- [x] 4.1 RED — Deferred contract specs for Make hook `2703382`: reject unsigned HMAC, malformed schema, replay, unknown `event_type`/`email_type` (legacy mismatch), duplicate `dedupe_key`/`event_id` → 401/400/dedupe. *Refs: design Threats, platform-boundaries Signed v1 + Legacy defects, blueprint.json.*
- [x] 4.2 Gates: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` pass. *Refs: openspec/config.yaml quality.*
- [x] 4.3 Verify WCAG AA light+dark (ink 15.95:1, muted 6.04:1, action 7.79:1), 44px targets, focus ring, `prefers-reduced-motion` crossfade, keyboard, `auto-fit minmax(280px,1fr)` no clip. *Refs: design-foundation Theme contrast + Accessible interaction.*
- [x] 4.4 Run 5/5 donor mocks <2min (phone daylight): badge+icon+order distinguishes critical/urgent/standard, one-sentence Handly explain. *Refs: handly-identity Success gates.*

## Out of Scope — Excluded (gate fails if touched)

Mockups/logo, `app/page.tsx` UI, DB migrations/RLS/Auth, pledge/TTL/SOS runtime, AI prompts, Resend templates, Make blueprint edits/deploys, offline/maps/SMS/analytics, test runner. Make = boundary only.

## Dependencies

1.1 → 2.1/2.2 → 3.1/3.2 → 4.1–4.4. No inversion; verifications block merge.
