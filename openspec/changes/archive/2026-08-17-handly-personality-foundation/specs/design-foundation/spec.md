# Design Foundation Specification

## Purpose

This is Handly's foundation, not a mockup. It follows `DESIGN.md` and `design.md`: light-first, WCAG AA, OKLCH Restrained, Geist-only, airy Linear/Notion density, and Tabler icons.

## Requirements

### Requirement: Semantic OKLCH theme tokens

The system MUST define these semantic tokens in OKLCH for light and dark themes, with foreground pairings audited to WCAG AA before release. `primary` MUST serve actions and wayfinding only and remain at or below 10% of a surface.

| Token | Light | Dark |
|---|---|---|
| background | `oklch(0.9815 0.005 165)` | `oklch(0.18 0.015 191)` |
| surface | `oklch(1 0 0)` | `oklch(0.22 0.015 191)` |
| ink | `oklch(0.23 0.02 173)` | `oklch(0.95 0.005 165)` |
| muted | `oklch(0.4835 0.023 172)` | `oklch(0.70 0.02 172)` |
| border | `oklch(0.871 0.016 167)` | `oklch(0.30 0.02 191)` |
| primary | `oklch(0.431 0.07 191)` | `oklch(0.72 0.08 191)` |
| focus | `oklch(0.488 0.217 264)` | `oklch(0.74 0.16 264)` |
| critical | `oklch(0.50 0.182 30)` | `oklch(0.70 0.14 30)` |
| urgent | `oklch(0.514 0.134 51)` | `oklch(0.75 0.11 51)` |
| standard | `oklch(0.454 0.073 223)` | `oklch(0.70 0.10 223)` |
| success | `oklch(0.469 0.099 158)` | `oklch(0.72 0.11 158)` |

#### Scenario: Theme contrast review

- GIVEN light and dark token sets
- WHEN text, controls, urgency, and focus combinations are audited
- THEN body text meets 4.5:1, large text meets 3:1, and failures block the task gate

### Requirement: Fixed type and layout scale

The system MUST use Geist only (Geist Mono for SOS codes and IDs), weights 400/500/600/700, and fixed sizes `12/14/16/18/24/32/40px`. Headings MUST use `text-wrap: balance`, prose SHOULD use `text-wrap: pretty` and remain 65–75ch. Spacing MUST use 4px units; breakpoints MUST be 640/768/1024/1280px; grids MUST use `repeat(auto-fit, minmax(280px, 1fr))`.

#### Scenario: Responsive catalog

- GIVEN a need catalog at any supported width
- WHEN the viewport crosses a breakpoint
- THEN structure adapts without fluid type, percentage grid math, or clipped headings

### Requirement: Accessible interaction foundation

Interactive targets MUST be at least 44px. Focus MUST be a visible 2px ring with 2px offset. Radius MUST be 8px for controls, 12px for cards, and pill only for tags. Elevation MUST use level 0 flat, level 1 `0 1px 3px`, and level 2 `0 4px 12px`; motion MUST use transform/opacity with ease-out-quart, 150–250ms, and an instant or crossfade reduced-motion alternative. Z-index MUST follow dropdown 10, sticky 20, backdrop 30, modal 40, toast 50, tooltip 60.

#### Scenario: Keyboard and reduced motion

- GIVEN a keyboard user and `prefers-reduced-motion: reduce`
- WHEN focus moves or a state changes
- THEN focus remains visible, targets remain usable, and decorative motion is removed

### Requirement: Airy component and dependency policy

Need Cards MUST order badge+icon+urgency sort order, title, quantity/unit, public zone, deadline/TTL, progress, and CTA; urgency MUST NOT rely on color alone. Cards MUST NOT use side stripes or nested cards. Pledge Dialog, mono SOS Badge, Empty/Loading/Error states, and Nav MUST have complete interaction/error states. shadcn MUST be selective for complex primitives; Tabler MUST be the single icon family at 1.75px stroke.

#### Scenario: Need card review

- GIVEN critical, urgent, and standard needs
- WHEN cards render in the catalog
- THEN label, icon, and ordering communicate urgency even without color

### Requirement: Impeccable anti-slop bans

The UI MUST NOT use warm cream/sand body backgrounds, gradient text, default glassmorphism, hero-metric templates, identical card grids, tiny tracked uppercase eyebrows on every section, numbered scaffolding, repeating-linear-gradient stripes, sketchy SVG illustrations, 32px+ card radii, or border-plus-wide-blur ghost cards.

#### Scenario: Visual gate review

- GIVEN a proposed component or screen
- WHEN it is checked against the ban list
- THEN any violation fails the design task gate and is redesigned before implementation

## Explicit Non-Goals

No mockups, logo, `app/page.tsx` UI, migrations, RLS, Auth, runtime promise, AI prompts, Resend templates, or Make edits are defined here.
