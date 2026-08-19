# Make Hook 2703382 — RED Contract (Deferred)

> Deferred boundary spec. No runtime implementation in this change — `app/page.tsx` UI, DB/Auth/TTL, AI, Resend, Make edits are explicitly excluded. This document is the contract that a future Route Handler + adapter must satisfy.

## Scope

- Hook: `donation_webhook` `2703382` in `Donation Email Dispatch.blueprint.json` (Make, external — never silently repaired here)
- Event `donation_goal_reached` v1 emitted by the application after a pledge commit reaches its goal
- Contract shape:

```json
{
  "event_id": "uuid",
  "event_type": "donation_goal_reached",
  "version": 1,
  "occurred_at": "ISO-8601 timestamp",
  "need_id": "uuid",
  "organization_id": "uuid",
  "recipient_email": "email",
  "locale": "es",
  "dedupe_key": "stable opaque string",
  "data": {}
}
```

- Signature header: `X-Handly-Signature` (HMAC over raw body)
- Adapter concern: legacy Make filter reads `{{2.email_type}}` vs interface `event_type`; future adapter maps v1 `event_type` to legacy `GOAL_ACHIEVED` without name mixing

## RED — Contract behavior (must be RED tests in a future change)

Each case is a contract test against the future Route Handler / adapter. No handler exists yet; these are the gates that will prove rejection, validation, and deduplication before any Make routing.

### 1. Reject unsigned HMAC → 401

- **Given** a well-formed v1 body with valid `event_type`, `locale`, `recipient_email`, fresh `occurred_at`, unique `dedupe_key`/`event_id`
- **When** the request has no `X-Handly-Signature` or a signature that does not verify against the shared secret
- **Then** respond `401 Unauthorized`, do not route to Make, record failure for retry/DLQ policy, no side effects on pledges

### 2. Malformed schema → 400

- **Given** any of: missing `event_id`/`event_type`/`version`/`need_id`/`organization_id`/`recipient_email`/`locale`/`dedupe_key`, wrong UUID/email/locale format, or `version !== 1`
- **When** the handler validates the body
- **Then** respond `400 Bad Request` with a machine-readable validation error, do not route, record failure

### 3. Replay / stale timestamp → 401 or 400 (replay)

- **Given** a correctly signed, schema-valid event whose `occurred_at` is outside the allowed skew (e.g. >5 min in the past or in the future)
- **When** the handler checks timestamp/replay window
- **Then** reject as replay (401 or 400 per handler convention), do not route, record replay attempt

### 4. Unknown event_type / legacy email_type mismatch → 400, no routing

- **Given** `event_type` not in the allowlist (only `donation_goal_reached` v1) or a legacy-shaped event that would match Make's `{{2.email_type}} == GOAL_ACHIEVED` filter but not the v1 interface
- **When** routing is evaluated
- **Then** respond `400`, do not route through Make Resend step, record unknown-type failure; adapter must not silently coerce names — mapping is explicit v1 → legacy inside adapter only if configured

### 5. Duplicate dedupe_key / event_id → dedupe (200 idempotent, no second email)

- **Given** a second delivery of a previously accepted `dedupe_key` (or `event_id`) within the dedup window — same bytes, possibly replayed by Make retry
- **When** the handler checks idempotency (DB/RPC `dedupe_key`+`event_id` unique constraint or equivalent)
- **Then** respond `200 OK` (or `202`) idempotently, do not trigger a second email, record deduped delivery; concurrent duplicates must not double-send

## Additional notes the future implementation must honor

- Unknown routing is unsafe — no fallback Resend send for unknown types.
- Legacy `org_name ×6` prefix and `email_type` vs `event_type` defects remain documented in `design.md` and blueprint; no silent JSON repair in this change.
- Failure recording feeds the future email retry/DLQ/SLA gate — not implemented here.

## Verification hook for sdd-verify

- This file existing + the 5 cases above readable is the Phase 4.1 gate.
- Real RED tests (e.g. `vitest` contract tests hitting the Route Handler) land in a later change when a test runner and Route Handler are in scope.
