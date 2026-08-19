---
name: Calm Operational
colors:
  surface: '#FFFFFF'
  surface-dim: '#ceddd7'
  surface-bright: '#eefdf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e8f7f0'
  surface-container: '#e2f1ea'
  surface-container-high: '#dcece5'
  surface-container-highest: '#d7e6df'
  on-surface: '#111e1a'
  on-surface-variant: '#3f4948'
  inverse-surface: '#26332f'
  inverse-on-surface: '#e5f4ed'
  outline: '#6f7978'
  outline-variant: '#bec9c7'
  surface-tint: '#226865'
  primary: '#004341'
  on-primary: '#ffffff'
  primary-container: '#0f5c59'
  on-primary-container: '#8fd2ce'
  inverse-primary: '#90d2ce'
  secondary: '#26667b'
  on-secondary: '#ffffff'
  secondary-container: '#aae6fe'
  on-secondary-container: '#29687d'
  tertiary: '#004529'
  on-tertiary: '#ffffff'
  tertiary-container: '#005f3a'
  on-tertiary-container: '#88d7a8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#abefea'
  primary-fixed-dim: '#90d2ce'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#00504d'
  secondary-fixed: '#b9eaff'
  secondary-fixed-dim: '#94cfe7'
  on-secondary-fixed: '#001f29'
  on-secondary-fixed-variant: '#004d61'
  tertiary-fixed: '#a4f4c3'
  tertiary-fixed-dim: '#88d7a8'
  on-tertiary-fixed: '#002111'
  on-tertiary-fixed-variant: '#005232'
  background: '#eefdf6'
  on-background: '#111e1a'
  surface-variant: '#d7e6df'
  paper-bg: '#F6FAF8'
  muted: '#52635D'
  border: '#CBD8D2'
  focus: '#1D4ED8'
  critical: '#B42318'
  urgent: '#A14B00'
typography:
  display:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.015em
  title:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  mono:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1200px
---

## Brand & Style

The design system is centered on the "Calm Instruction Sheet" aesthetic—a philosophy of operational serenity designed for high-stakes emergency donation coordination. It rejects the chaos of traditional crisis dashboards in favor of a clinical, authoritative, and daylight-readable interface. The visual voice is quiet, precise, and hospital-calm, ensuring that donors and operators can act decisively without cognitive overload.

The style is a strict interpretation of **Minimalism**, prioritizing whitespace, linear discipline, and typographic perfection. It utilizes a restrained color strategy where chromatic accents are disciplined by functional utility. Every visual choice is made to earn trust through clarity, reading like a clean document pinned to a triage wall rather than a marketing campaign.

- **Operativa Serena:** A voice that is calm under pressure, direct, and hospitable.
- **Precision Engineering:** Relying on alignment and strict grids rather than decorative elements.
- **Zero-Decoration Tax:** Explicitly bans gradients, glassmorphism, and illustrative clutter.

## Colors

The palette is governed by **The Restrained Rule**, ensuring the primary Institutional Teal never exceeds 10% of any viewport. Chromatic presence is reserved for actions and selection states to maintain focus. The canvas uses a teal-tinted "Paper" background to eliminate glare and enhance readability in outdoor, high-glare emergency environments.

### Named Rules

- **The Non-Color Urgency Rule:** Urgency must never be communicated by color alone. Every priority state must use a badge, an icon, and a specific sort order.
- **The No-Cream Rule:** Warm sand, beige, or cream tones are strictly forbidden. The neutrals must remain teal-tinted and cool.
- **Contrast:** All text-on-background combinations are strictly WCAG AA compliant. The primary "Ink" on "Paper" provides a high-contrast 15.95:1 ratio for maximum legibility.

### Semantic Roles

- **Critical:** Reserved for life-saving needs (4h TTL).
- **Urgent:** Elevated needs (12h TTL).
- **Standard:** Routine operational needs (24h+ TTL).
- **Success:** Fulfilled or received status.

## Typography

This design system follows **The One-Family Rule**, utilizing Geist for all UI elements and Geist Mono exclusively for reference codes and system identifiers. Hierarchy is established through weight and scale contrast rather than font pairing.

- **Tracking:** Display and Headline levels use negative tracking for cohesion. Labels and captions use slight positive tracking to preserve legibility at small sizes.
- **Balance:** `text-wrap: balance` is mandatory for headlines. `text-wrap: pretty` is used for body prose to avoid orphans.
- **Prose Constraints:** Body text is capped at 65–75 characters per line to ensure optimal reading speed and comfort.
- **Fixed Scale:** Fluid typography is forbidden. The system uses a fixed rem scale (12 / 14 / 16 / 18 / 24 / 32 / 40) to ensure predictable UI reflows on mobile devices.

## Layout & Spacing

The layout is built on a 4px baseline rhythm, emphasizing an airy, breathable distribution of content. The philosophy prefers whitespace over dividers to separate operational sections.

- **Grid System:** A fluid grid that transitions from 1 column on mobile to 3 columns on desktop using `auto-fit minmax(280px, 1fr)`. This ensures cards remain large and legible rather than shrinking into tiny, cluttered tiles.
- **Section Margins:** High-level operational sections are separated by 48px to 64px to maintain the "instruction sheet" clarity.
- **Touch Targets:** All interactive elements maintain a minimum 44px target area.
- **Alignment:** Strict left-alignment for all data points and labels. Tabular alignment is used for numeric quantities and mono-spaced timestamps to allow for rapid vertical scanning.

## Elevation & Depth

Depth is treated as a functional state cue rather than a decorative flourish, following **The State-Only Elevation Rule**. At rest, the interface is completely flat.

- **Level 0 (Flat):** All resting cards, backgrounds, and inputs. Depth is conveyed via a 1px `border` stroke.
- **Level 1 (Lifted):** Applied only to hovered cards or active controls. Uses a subtle, teal-tinted shadow (`0 1px 3px oklch(0.23 0.02 173 / 0.08)`).
- **Level 2 (Floating):** Reserved for high-priority interruptions like modal dialogs, popovers, and toasts. Uses a more diffused tinted shadow.

**Constraint:** Never pair a 1px border with a shadow greater than 16px blur (ghost-cards). Use either a border for structure or a shadow for state, never both in high-contrast decorative combinations.

## Shapes

The shape language is precise and hierarchical. It uses specific radii to distinguish between small interactive controls and larger content containers.

- **Rounded (0.5rem / 8px):** The standard for buttons, input fields, and small UI controls.
- **Rounded-LG (1rem / 12px):** Reserved for need cards, modal sheets, and main content containers.
- **Pill-shaped:** Used exclusively for badges, tags, and progress bar caps to create a distinct visual contrast from the rectangular grid.

Hard-edged (0px) shapes are avoided to maintain the "hospitable" aspect of the brand, while overly round (32px+) shapes are banned to preserve the professional, operational character of the triage environment.

## Components

### Buttons

Primary buttons use the Institutional Teal fill with white text. Secondary buttons are white with a 1px border stroke. Interactive states include a 2px `focus` ring with a 2px offset for accessibility. No gradient or glass effects are permitted.

### Need Cards

Need cards are the primary data unit. They must include:

1. **Urgency Badge:** Redundant cue (icon + text + color).
2. **Title:** Geist Title weight.
3. **Quantity:** Geist Mono for unambiguous reading.
4. **Context:** Zone location (exact address is masked until pledge).
5. **Progress:** A dual-tone bar showing fulfillment levels.

### Pledge Dialog

A focused modal using Level 2 elevation. Labels are placed strictly above input fields. Confirmation screens display an unambiguous Crockford Base32 short code (`SOS-XXXX`) in Geist Mono for manual verification at receiving centers.

### SOS Badges

High-contrast pills using Geist Mono. These are the primary link between the digital system and physical logistics. They must have a "copy" affordance and maintain a bold tracking for clarity in low-light intake environments.

### Empty & Loading States

Skeleton screens must match the exact geometry of the final component. Centered spinners are forbidden; instead, use shimmering blocks that respect the 8px/12px radius scale.
