# Handly Identity Specification

## Purpose

Handly is the public product; repository `handly` (renamed from `coderhub` in Phase 1). This specification defines the identity contract for the donor-first MVP. It traces to `proposal.md`, `design.md`, and the owner guidance in `DESIGN.md`; `docs/PROPUESTA_ARQUITECTURA.md` remains a hypothesis.

## Requirements

### Requirement: Public identity and bounded audiences

The product MUST present **Handly** publicly and MUST treat the guest donor as the primary audience. Organization operators and collection workers MAY be supported as authenticated operational audiences, but their workflows MUST NOT redefine the donor-first public identity.

#### Scenario: Repository rename completed

- GIVEN a public page and a repository path after Phase 1
- WHEN a user sees product identity or source paths
- THEN product copy says Handly and repository references say `handly`

### Requirement: Operativa serena voice

User-facing language MUST be calm under pressure, direct, respectful, hospitable, and action-first. Public donor copy MUST be concise and actionable; emergency copy MUST be urgent without panic; operator/acopio copy MUST emphasize precise status and provenance. Public copy MUST use neutral Spanish selected by `locale`; it MUST NOT hardcode an Argentina-specific variant. “AI proposes, a human confirms” MUST be expressed as behavior and provenance, not as an unverified claim.

#### Scenario: Emergency need is shown

- GIVEN a confirmed urgent need with quantity and unit
- WHEN a donor reads its summary
- THEN copy names urgency, need, quantity, and next action without panic or guilt

### Requirement: Safe, specific microcopy

Copy MUST name the need, quantity, unit, zone, deadline, and action when those facts exist. Do use `Urgente: se necesitan 20 botiquines. Confirmado por la organización.` Do not use guilt, panic, guarantees, `Confirmado por IA`, invented SOS codes, or invented urgency. Exact addresses MUST NOT be public.

#### Scenario: Confirmation provenance is visible

- GIVEN an AI-generated proposal awaiting human review
- WHEN it is displayed to an operator or donor
- THEN it is marked as proposed and cannot be worded as organizational confirmation

### Requirement: Stable state language

The interface MUST provide locale-aware, testable language for loading, empty, error, success, expired, cancelled (future), and partial states. The canonical neutral-`es` examples are: `Cargando necesidades activas…`; `No hay necesidades activas en esta zona.`; `No pudimos guardar la reserva. Revisa los datos e intenta de nuevo.`; `Reserva confirmada. Guarda tu código SOS-7X9K.`; `La reserva venció y el cupo volvió a estar disponible.`; `La reserva fue cancelada. El código ya no está activo.`; and `Recibimos 3 de 5 unidades. La necesidad sigue abierta por 2.`

#### Scenario: Reservation state changes

- GIVEN a donor sees loading, success, expired, or partial data
- WHEN the corresponding state is rendered
- THEN the message identifies the current state and the next safe action without ambiguity

### Requirement: Identity success gates

Identity MUST be considered successful only when five of five donor mocks distinguish critical, urgent, and standard needs in under two minutes without color-only cues, and a donor can explain Handly’s purpose in one sentence. These gates MUST remain traceable to proposal success criteria and task verification.

#### Scenario: Donor comprehension review

- GIVEN five realistic donor flows on a phone in daylight
- WHEN reviewers time and question each flow
- THEN all five meet the two-minute and one-sentence comprehension gates

## Explicit Non-Goals

This specification does not define mockups, logo artwork, `app/page.tsx` UI, database migrations, RLS, Auth implementation, runtime delivery promises, AI prompts, Resend templates, or Make edits.
