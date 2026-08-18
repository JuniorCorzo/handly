# Exploration: coderhub-personality-foundation

## Current State

The repository is a clean Next.js boilerplate, not an implemented donation platform yet:

- `app/page.tsx` is still the create-next-app screen with Next.js/Vercel links.
- `app/layout.tsx` still exposes `Create Next App` metadata, uses `lang="en"`, and loads Geist and Geist Mono through `next/font`.
- `app/globals.css` already uses Tailwind CSS 4 correctly through `@import "tailwindcss"` and `@tailwindcss/postcss`, but `body` hardcodes Arial instead of the Geist token.
- `package.json` contains only Next 16.3.1, React 19.2.8, Tailwind 4, TypeScript, ESLint, and their types. There is no Supabase, AI SDK, Zod, Resend, icon library, UI library, or test runner.
- `openspec/specs/` is intentionally empty. The only product/architecture material is the proposal document, so there is no accepted domain specification yet.
- The repository is dirty from pre-existing work: `.gitignore` is modified and the Make blueprint plus `openspec/` are untracked. This exploration does not alter those files.

The repository name is `coderhub`, while the proposal calls the product `Triage SOS`. This is a naming hypothesis, not an accepted rename.

`docs/PROPUESTA_ARQUITECTURA.md` is useful discovery input, but it must not be treated as truth. It describes a donation-coordination MVP with AI triage, public needs, guest pledges, short SOS codes, PostgreSQL transactions, Supabase Auth, and urgency-based TTLs. It does not resolve the product decisions that make those mechanisms safe or meaningful.

`openspec/config.yaml` currently says that the proposal is the canonical product/architecture source and asks future proposals to reference it as such. That configuration conflicts with the user's explicit rule. Before proposal work, the authority model must be corrected: the proposal is a hypothesis to challenge, and accepted decisions should become OpenSpec requirements only after review.

### Legacy Make automation

The file `Donation Email Dispatch.blueprint.json` describes this flow:

```text
Make Custom Webhook (HandlyWebHook, hook 2702048)
  -> BasicRouter (Classify Email)
     -> email_type == "meta_alcanzada"
        -> Resend sendAnEmail (linked Resend connection)
     -> fallback "Tipo desconocido"
        -> an unconfigured Resend module
```

It is an external legacy automation, not part of the Next.js core. The export is incomplete:

- `from: "rewrw@das"` and `subject: "ew"` are obvious placeholders.
- The Resend module is set to HTML mode, but neither `html` nor `text` content is mapped.
- `{{recipient_email}}` is not scoped to the webhook payload in the export, so its origin and validity are unclear.
- The fallback route has no usable Resend parameters and has `conditions: null`; it is not a safe unknown-type handler.
- There is no visible payload validation, authentication/signature check, idempotency key, duplicate suppression, explicit retry policy, or dead-letter queue (`dlq: false`).
- The scenario is instant, non-sequential, auto-committing, and configured for up to three errors. That is operational configuration, not a guarantee of reliable delivery.

The linked Resend connection may already work in Make, but the blueprint alone does not prove that a valid email can currently be sent.

### Verified best-practice constraints

The official documentation checked through Context7 supports these guardrails:

- Next.js Server Functions must authenticate and authorize mutations and validate their inputs. Server Actions are dispatched sequentially per client; they are not a substitute for a properly designed transaction or a general-purpose event worker. Route Handlers are a better boundary for external HTTP integrations or work that needs independent request semantics.
- Supabase requires RLS to be enabled and explicit policies to be defined for the roles that need access. Public reads and guest writes must be deliberately scoped. RLS is not present in the proposal, and a Server Action alone does not solve the database authorization or transaction-boundary problem.
- The current AI SDK documentation supports schema-validated structured output through `generateObject`, and newer examples use `generateText` with `Output.object`. Schema validation checks shape; it does not verify that an urgency, quantity, address, or category is factually correct. A human confirmation and deterministic fallback are still required.

CodeGraph was checked first as required for structural exploration, but this checkout has no `.codegraph/` index. Per the repository instructions, the index was not initialized; the analysis used targeted filesystem inspection instead.

## Affected Areas

- `app/layout.tsx` — brand metadata, language, typography loading, and global shell.
- `app/globals.css` — semantic color/type tokens, light/dark strategy, and the current Arial/Geist inconsistency.
- `app/page.tsx` — current boilerplate entry point; later personality work will replace it, but this exploration does not.
- `package.json` and `pnpm-lock.yaml` — the real dependency baseline and the fact that proposed integrations are not installed.
- `docs/PROPUESTA_ARQUITECTURA.md` — product/architecture hypothesis requiring challenge, especially around RLS, locking, TTL, AI, identity, and scope.
- `Donation Email Dispatch.blueprint.json` — external legacy email automation and its unresolved contract with the future product.
- `openspec/config.yaml` — current SDD authority rule contradicts the agreed non-canonical status of the proposal.
- `openspec/specs/README.md` — confirms that no accepted domain specs exist yet.
- `.atl/skill-registry.md` — confirms the project skill registry and its generated status.

## Approaches

### 1. Personality directions

| Direction | Tone, voice, values | Example microcopy | Tradeoff |
|---|---|---|---|
| **Operational humanitarian** | Calm under pressure, direct, respectful, action-first. Values dignity, clarity, and urgency without panic. | `Primero lo urgente. Elegí qué podés acercar hoy.` | Best for emergency decisions and field use; can feel less emotionally warm if not written carefully. |
| **Technical trustworthy** | Precise, transparent, evidence-led. Explains status, limits, and who confirms what. | `La IA propone. Una persona confirma.` | Builds strong trust and auditability; can feel bureaucratic to casual donors. |
| **Solidarity community** | Warm, inclusive, close, and encouraging. Values mutual aid and visible contribution. | `Tu aporte ayuda a completar esta necesidad.` | Easier to approach and share; may soften urgency or accidentally gamify a serious situation. |

### 2. Stack and frontend directions

| Area | Option | Benefits | Costs / open risk |
|---|---|---|---|
| Typography | Keep Geist + Geist Mono | Already loaded, clean at small sizes, low migration cost. | Generic unless personality comes from voice, color, and layout; current body CSS must stop hardcoding Arial. |
| Typography | IBM Plex Sans + Mono | More institutional and operational; strong distinction between prose and data. | Adds a brand decision and font migration before the audience is validated. |
| Typography | Accessibility-first alternative such as Atkinson Hyperlegible | Makes readability a visible brand value. | Needs real reading tests; may feel less familiar or polished for a public launch. |
| UI system | Tailwind 4 only | No new dependency, maximum control, fast foundation. | Repeated dialogs, forms, focus states, and errors can drift without a component contract. |
| UI system | Selective shadcn/ui components on Tailwind | Owns the source code and provides a strong starting point for accessible interactive primitives. | Not installed; defaults must be deliberately restyled and the project must commit to one component vocabulary. |
| Icons | Lucide | Clear, familiar outline language; already named in the proposal. | It is not installed, and the proposal is not authority. It should not be adopted without an explicit decision. |
| Icons | Phosphor or Tabler, one family only | More expressive weights and states while keeping a coherent set. | Adds a dependency and requires one global weight/stroke rule. |
| Theme | Light-first, high-contrast operational UI with a tested dark mode | Better for field use in daylight, readable status hierarchy, and safer than using red alone for urgency. | Requires semantic tokens and testing in both modes; dark mode cannot be an afterthought. |
| Theme | Dark-first control-room UI | Comfortable for some nighttime monitoring contexts and visually distinctive. | Weaker in bright outdoor conditions and can turn urgent colors into glare; not a good default without user evidence. |
| Data provider | Keep provider-agnostic initially | Does not prematurely lock Supabase, Neon, Auth, or Edge Functions. | Delays some implementation details and requires explicit boundaries later. |
| Data provider | Supabase full platform | Database, Auth, RLS, Realtime, and Functions in one ecosystem. | Provider coupling; RLS, guest access, and transaction execution must be designed, not assumed. |
| Data provider | PostgreSQL elsewhere plus separate services | More composable and less tied to one vendor. | More integration and operational responsibility, especially for Auth and realtime updates. |

### 3. Make integration directions

| Direction | Benefits | Costs / risks | Effort |
|---|---|---|---|
| **Keep Make as external orchestrator** | Preserves the existing Resend connection, lets the legacy owner continue, and avoids coupling email delivery to the first Next.js slice. | Requires a versioned webhook contract, authentication, validation, idempotency, observability, and ownership. Failures live outside the repository. | Low initially, medium to harden. |
| **Move email into Next.js with Resend SDK** | Typed event contract in the repository, easier code review, and clearer product ownership. | Requires server-only secret handling, post-commit delivery design, retries, duplicate suppression, and an outbox or equivalent durable boundary. A Server Action alone is not a queue. | Medium. |
| **Move email to a database-adjacent Function** | Can react close to persisted events and isolate email from the web request. | Only makes sense after choosing a provider; still needs retries, idempotency, monitoring, and provider-specific deployment. It increases Supabase coupling. | Medium to high. |

A candidate event contract for discussion, not a final decision, is:

```json
{
  "event_id": "uuid",
  "event_type": "donation_goal_reached",
  "version": 1,
  "occurred_at": "timestamp",
  "need_id": "uuid",
  "organization_id": "uuid",
  "recipient_email": "email",
  "locale": "es",
  "dedupe_key": "stable-key"
}
```

The exact event name, recipient, trigger moment, body, and ownership remain open. The foundation should define the boundary, not silently repair or absorb the Make scenario.

## Recommendation

Choose **Operational humanitarian** as the primary personality: calm, direct, and respectful. Borrow the transparency rules from **Technical trustworthy** as a product behavior, not as a second competing voice. This combination matches emergency coordination better than a cheerful community-first tone: users need to know what is urgent, what is confirmed, and what they can do next without feeling manipulated.

For the frontend foundation, keep the existing Next.js 16 App Router, React Server Components by default, Tailwind CSS 4, TypeScript strict, pnpm, and Geist as the provisional typography baseline. Correct the Arial inconsistency and make all color/type choices semantic. Use a light-first, high-contrast token system with a deliberately tested dark mode. Add shadcn/ui selectively only for complex interactive primitives, and choose one icon family after the accessibility/readability review; Phosphor or Tabler is the current recommendation over inheriting Lucide from the unapproved proposal.

Do not commit to Supabase or Neon in this foundation. Define a provider boundary and record the decision gates: RLS policy shape, transaction execution path, Auth/membership model, guest access, realtime need, and operational ownership. If Supabase is later chosen, the design must include explicit RLS policies and a real transaction/RPC boundary; `FOR UPDATE` written in a diagram is not enough.

For Make, use a **controlled hybrid transition**: keep the legacy scenario outside the Next.js core for now, but define a versioned, authenticated, idempotent event contract and mark the current blueprint as incomplete. The foundation must not depend on the placeholders. Migration to in-app delivery can be a later change once the email trigger and delivery guarantees are known.

### What `design.md` should contain

`design.md` should define the approved foundation, not mockups:

- product naming status and the primary audiences/jobs;
- personality thesis, values, voice, tone by context, do/don't examples, and emergency-safe microcopy;
- content and state language for loading, empty, error, success, expired, cancelled, and partially received flows;
- semantic color roles, typography roles and scale, spacing, borders, radius, elevation, icon family, motion, reduced motion, and light/dark rules;
- responsive and accessibility requirements, including non-color status cues and keyboard/focus behavior;
- Next.js/RSC/client boundaries, Tailwind conventions, component-system decision, and dependency policy;
- provider decision matrix for PostgreSQL, Auth, AI, email, and realtime without presenting any vendor as already selected;
- the Make integration boundary, event schema, ownership, authentication, idempotency, retry and failure expectations;
- explicit decisions, rejected alternatives, unresolved questions, and decision gates.

It must explicitly exclude the mockups and logo that the user will create separately. It also excludes production implementation, database migrations, provider setup, AI prompts/models, real email templates, and the Make scenario rewrite.

### Concrete scope for this foundation change

**In scope:**

- challenge and refine the product/personality direction;
- agree on naming status, audiences, tone, and UX writing principles;
- establish the frontend/stack decision record and semantic design-token rules;
- define the provider-agnostic boundaries for database, Auth, AI, email, and realtime;
- document the legacy Make contract and its unresolved risks;
- record open questions and decision gates for proposal/spec/design work;
- update SDD authority rules if the team confirms that the proposal is not canonical.

**Out of scope:**

- mockups, logo, visual assets, or a finished landing page;
- replacing the boilerplate with product UI;
- Supabase project creation, schema, migrations, RLS policies, or Auth setup;
- AI triage implementation, prompt design, model selection, or fallback code;
- reservation/pledge implementation, TTL jobs, SOS code generation, or realtime subscriptions;
- Make edits/deployment, Resend templates, or production email sending;
- offline/PWA support, maps, SMS/WhatsApp, analytics implementation, and test-runner installation.

### Risks and proposal blockers in the Triage SOS hypothesis

- `FOR UPDATE` only protects a real database transaction. The proposal does not define how the selected client/provider executes that transaction, nor how RLS and server authorization interact.
- No RLS policies are specified for public catalog reads, guest pledges, organization data, or reception actions.
- Rigid PostgreSQL ENUMs can make category, urgency, status, and unit changes expensive while the domain is still being discovered.
- Predefined zones are hardcoded without governance, versioning, address precision, or a privacy rule.
- AI structured output can be syntactically valid but operationally wrong. There is no confidence threshold, human review, deterministic fallback, or provider/data-retention policy.
- Lazy expiration can leave stale pending rows and stale progress unless every read and write handles expiry consistently; notifications and reporting may still need scheduled work.
- A unique SOS code does not itself solve collision retries, enumeration, rate limiting, or a safe lookup policy.
- Organization-only Auth leaves guest donor identity, duplicate pledges, cancellation, consent, retention, and auditability unresolved.
- The “real-time” promise has no selected transport or dependency, and the five-day scope is too broad for a repository with no tests or domain code.
- Cascading deletes and missing audit/event tables could erase useful donation history.
- No idempotency contract is defined for reservations or external email events.

## Open Questions

1. Is `coderhub` the product name, an internal repository name, or should the public product use `Triage SOS`?
2. Who is the primary first user: a donor, an organization operator, or an acopio/reception worker?
3. Which country, disaster contexts, time zones, and Spanish variant must the first release support?
4. Which need categories and units are controlled, and who can add or correct them?
5. Are zones curated by an administrator, created by organizations, or imported from an external source?
6. What location precision is safe to show publicly: zone, facility, neighborhood, or exact address?
7. Who sets urgency, can it be overridden, and what evidence makes a need critical, urgent, or standard?
8. Are 4h/12h/24h real operational commitments or only proposal examples? What happens after expiry?
9. Which pledge states and partial-fulfillment rules are required, and when is a goal considered reached: pledged, received, or verified?
10. How are guest donors identified, contacted, cancelled, rate-limited, and retained for audit/privacy purposes?
11. How are SOS codes generated, retried on collision, expired, printed, and protected from enumeration?
12. What exact event triggers `meta_alcanzada`: a committed quantity, a physically received quantity, or an operator confirmation?
13. Who is `recipient_email`: the organization, a zone coordinator, the donor, an operations inbox, or several recipients?
14. Who owns the Make scenario, webhook secret, Resend sender domain, retries, incident response, and eventual migration?
15. Is email a best-effort notification or a delivery guarantee? What deduplication, retry, and audit evidence is required?
16. Is the first product Spanish-only, bilingual, or prepared for localization from the start?
17. Is offline/PWA support required for the first field workflow or explicitly deferred?
18. What success metrics matter: time to publish a need, fulfilled-needs rate, over-donation rate, operator completion time, email delivery, or user trust?
19. What accessibility and device constraints are non-negotiable for donors and field operators?
20. Which provider responsibilities are actually desired before choosing Supabase, Neon, a separate Auth service, or an in-app email worker?

## Ready for Proposal

**No, not yet.** The exploration is complete, but proposal work should wait for decisions on naming, primary audience, personality direction, urgency/TTL semantics, pledge lifecycle, email trigger/recipient, language/accessibility, and the provider boundary. Once those are answered, run `sdd-propose`; do not treat the existing architecture proposal or Supabase as pre-approved.
