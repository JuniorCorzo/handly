# Platform Boundaries Specification

## Purpose

Handly remains provider-agnostic until gates are approved. This contract follows `design.md` and `DESIGN.md`; `docs/PROPUESTA_ARQUITECTURA.md` is hypothesis input only. The external Make blueprint is bounded and documented without silently repairing it.

## Requirements

### Requirement: Provider-neutral interfaces and gates

DB, Auth/guest, AI, email, and realtime MUST be replaceable interfaces, not selected vendors. Tasks MUST gate provider choice, RLS, real transaction/RPC execution, guest identity/retention, exact-address authorization, AI confidence/human confirmation/fallback, email SLA/retry/dedupe/DLQ, and realtime need or polling fallback.

#### Scenario: Provider is unresolved

- GIVEN no provider gate has been approved
- WHEN implementation tasks are planned
- THEN they define contracts and evidence gates rather than installing or assuming Supabase, Neon, an AI vendor, or an email SDK

### Requirement: Expire-only pledge semantics

The application MUST use expire-only pending pledges with TTL `4h/12h/24h` for critical/urgent/standard needs. Every read and write that counts or mutates pending pledges MUST exclude rows whose expiry has passed. Make MUST NOT own TTL or cancellation; SOS cancellation is future scope.

#### Scenario: Expired pledge is encountered

- GIVEN a pending pledge whose `expires_at` is in the past
- WHEN availability, progress, or a mutation is evaluated
- THEN it is excluded without requiring a scheduled cleanup job

### Requirement: Extensible categories and dual-location privacy

The catalog MUST support Agua, Alimentos, Ropa, Salud, Abrigo, and additional versioned categories. Categories MUST NOT use a rigid database ENUM. Public responses MUST expose only a zone or neighborhood; an exact address MAY be returned only to an authorized pledged donor.

#### Scenario: Unknown category or unauthorized address

- GIVEN an organization adds a governed category or a public visitor requests location data
- WHEN the boundary validates the request
- THEN the category remains extensible and the visitor receives no exact address

### Requirement: Locale-neutral language boundary

User-facing Spanish MUST be neutral and selected through `locale`; the platform MUST NOT hardcode `es-AR` or regional slang into contracts, event meaning, or shared copy keys.

#### Scenario: Locale changes

- GIVEN the same domain event is rendered for two supported locales
- WHEN copy is selected
- THEN semantics stay identical while locale-specific presentation is substituted

### Requirement: Server-authoritative SOS generation

SOS codes MUST be generated server-side, collision-retried, rate-limited, and non-enumerable. The boundary MUST NOT expose a code, exact address, or lookup result before the relevant confirmation and authorization.

#### Scenario: Code collision or probing

- GIVEN a generated code collides or a client probes sequential codes
- WHEN the server handles the request
- THEN it retries safely or throttles/rejects probing without revealing whether another pledge exists

### Requirement: Signed Make donation-goal event v1

After a committed goal is reached, the application MUST emit `donation_goal_reached` v1 with `event_id`, `event_type`, `version`, `occurred_at`, `need_id`, `organization_id`, `recipient_email`, `locale`, `dedupe_key`, and `data`. Ingress MUST validate `X-Handly-Signature` HMAC, schema, email, locale, timestamp, and replay; deduplication MUST use `dedupe_key` or `event_id`. An adapter MAY map v1 to legacy `GOAL_ACHIEVED`. The app owns emission/secret; Make owns routing/DLQ.

#### Scenario: Duplicate or invalid event

- GIVEN an unsigned, malformed, replayed, or duplicate event
- WHEN the integration boundary receives it
- THEN it rejects or deduplicates it before routing and records the failure for retry/DLQ policy

### Requirement: Legacy blueprint defects remain explicit

The blueprint at hook `2703382` MUST remain an external legacy input, not repaired here. Known defects MUST remain documented: `org_name` repeats six times, the filter compares `{{2.email_type}}` to `GOAL_ACHIEVED` while the interface declares `event_type`, and HMAC, schema validation, idempotency, deduplication, and DLQ are absent. Unknown routing is unsafe.

#### Scenario: Blueprint review

- GIVEN a task references `Donation Email Dispatch.blueprint.json`
- WHEN scope is reviewed
- THEN defects are reported as known risks and no Make JSON, route, template, or deployment is silently modified

## Explicit Non-Goals

No mockups, logo, `app/page.tsx` UI, migrations, RLS implementation, Auth implementation, runtime delivery promise, AI prompts, Resend templates, or Make edits are included.
