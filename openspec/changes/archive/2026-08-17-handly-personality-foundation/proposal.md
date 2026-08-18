# Proposal: handly-personality-foundation

## Intent
Establish **Handly** as public MVP (repo `handly`, renamed from `coderhub` in Phase 1). Primary job: guest donor browses needs, pledges quantity, gets `SOS-XXXX` without auth. Fix authority: `docs/PROPUESTA_ARQUITECTURA.md` and Supabase are hypotheses. Lock personality, tokens, provider boundaries before specs.

## Scope

### In Scope
- Handly naming; donor primary, operator/acopio bordered
- Personality: operational-humanitarian (calm, direct, respectful, action-first); `AI proposes, human confirms` as behavior; voice by context + emergency-safe microcopy
- Stack: Next 16 RSC, Tailwind 4, TS strict, pnpm, Geist (fix Arial), selective shadcn/ui, one icon family, light-first + tested dark
- Tokens, type scale, a11y/motion/focus; fix `openspec/config.yaml` authority
- Provider-agnostic DB/Auth/AI/email/realtime + decision matrix (no lock)
- Versioned Make `donation_goal_reached` v1: auth, validation, idempotency, retry/DLQ, ownership

### Out of Scope
- Mockups/logo, `app/page.tsx` UI, migrations/RLS/Auth, pledge/TTL/SOS, AI prompts, Resend templates, Make fix/deploy, offline/maps/SMS/analytics, test runner

## Capabilities

### New Capabilities
- `handly-identity`: naming, jobs, personality/voice/microcopy
- `design-foundation`: tokens, typography, theme/a11y, Next/RSC, component/icon policy
- `platform-boundaries`: provider contracts + Make webhook

### Modified Capabilities
- None — `openspec/specs/` empty

## Approach
Personality-first; light-first tokens (Arial→Geist via `next/font`); shadcn/ui only for complex primitives; one icon family (Phosphor/Tabler pending a11y review, not Lucide). Providers as interfaces only. Make stays external: `event_id, event_type, version=1, occurred_at, need_id, organization_id, recipient_email, locale, dedupe_key` + HMAC, schema, idempotency on `dedupe_key`. `meta_alcanzada` on pledge, not receipt. `design.md` owns tokens/voice/boundaries, excludes mockups/logo.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/layout.tsx` | Modified | Brand meta, `lang="es"`, Geist token |
| `app/globals.css` | Modified | Semantic tokens, remove Arial |
| `openspec/config.yaml` | Modified | Remove canonical proposal rule |
| `Donation Email Dispatch.blueprint.json` | Referenced | External, not edited |
| `design.md` | New | Tokens/voice/boundaries (next phase) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `FOR UPDATE` without real tx | High | Gate on explicit tx/RPC |
| Missing RLS | High | Gate on RLS matrix |
| AI shape-valid but wrong | High | Confidence + human confirm + fallback |
| Lazy TTL stale | Med | Expiry on every read/write |
| SOS collision/enumeration, guest dedup | Med | Retry, rate-limit, `dedupe_key` |
| Make no auth/idempotency | High | HMAC, validation, idempotency, DLQ |

## Rollback Plan
Revert `openspec/config.yaml` + proposal; no runtime code. Make v1 additive — disabling webhook restores prior.

## Dependencies
- Resend via Make conn 10488338 (verify sender domain); Make owner for secret rotation

## Success Criteria
- [ ] Mock donor pledges <2 min unauth; explains Handly in one sentence
- [ ] Urgency without color-only cue; WCAG AA light+dark
- [ ] `globals.css` tokens; no Arial; one icon family
- [ ] Make v1 documented; blueprint flagged incomplete
- [ ] `openspec/config.yaml` hypothesis-only; gate list agreed

## Proposal question round — RESOLVED 2026-08-17 (interactive)
1. Cancel vs expire: **En la APP, no en Make.** El pledge vive en tu BD (`pledges.expires_at` + TTL 4/12/24h). Make solo manda el email. Para MVP: **expire-only** (la reserva expira sola); `cancel` con SOS-XXXX queda para siguiente capa. Decisión puede convivir con expire sin tocar Make.
2. Catalog: **Agua, Alimentos, Ropa, Salud, Abrigo + etc. extensible.** MVP arranca con esas 5 curadas por la org; `etc.` queda como categoría abierta versionada (no ENUM rígido).
3. Location: **Ambas.** Público ve zona/barrio; donante con pledge ve dirección exacta del acopio (privacidad por defecto).
4. Language: **`es` neutro con `locale`** (no es-AR hardcodeado).
5. Metric: **Supuesto aceptado — 5/5 mocks <2 min distinguiendo urgente/estándar.**

Blueprint actualizado 2026-08-17 revisado en `Donation Email Dispatch.blueprint.json` (ver notas abajo).

## Decisions / Alternatives / Gates
- **Decided:** Handly public/coderhub repo; donor primary; operative-humanitarian; `meta_alcanzada` on pledge.
- **Rejected:** community-warm voice, dark-first, Lucide default, Supabase lock, silent Make repair.
- **Gates:** provider, RLS, tx/RPC, urgency/TTL, SOS, guest idempotency/retention, AI confidence, email retry, a11y.
