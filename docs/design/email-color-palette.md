# Email Templates — Hexadecimal Color Palette

This document contains the exact hexadecimal color palette used across Handly email templates (`supabase/templates/magic_link.html` and `supabase/templates/invite.html`).

---

## 1. Brand & CTA Actions

| Token Name | Hex Code | Description / Usage |
| :-- | :-- | :-- |
| `--email-btn-primary` | `#2563eb` | Primary button background color (Blue 600) |
| `--email-btn-hover` | `#1d4ed8` | Interactive hover state (Blue 700) |
| `--email-btn-text` | `#ffffff` | High contrast button text |
| `--email-brand-accent` | `#0284c7` | Logo accent & header badge text (Sky 600) |
| `--email-badge-bg` | `#e0f2fe` | Header badge subtle background (Sky 100) |
| `--email-badge-border` | `#bae6fd` | Header badge border (Sky 200) |

---

## 2. Light Mode (Canonical)

| Token Name | Hex Code | Description / Usage |
| :-- | :-- | :-- |
| `--email-bg-body` | `#f8fafc` | Full email viewport background (Slate 50) |
| `--email-bg-card` | `#ffffff` | 560px centered container card background |
| `--email-border` | `#e2e8f0` | Card borders and horizontal dividers (Slate 200) |
| `--email-box-subtle` | `#f1f5f9` | User metadata / email highlight box (Slate 100) |
| `--email-text-title` | `#0f172a` | Primary titles and headings (Slate 900) |
| `--email-text-body` | `#334155` | Paragraphs and instruction text (Slate 700) |
| `--email-text-muted` | `#64748b` | Subtitles, labels, and fallback URLs (Slate 500) |

---

## 3. Semantic & Security Statuses

| Token Name | Hex Code | Description / Usage |
| :-- | :-- | :-- |
| `--email-success-text` | `#047857` | Verified checkmark & security badge text (Emerald 700) |
| `--email-success-bg` | `#f0fdf4` | Verified status background (Emerald 50) |
| `--email-success-border` | `#bbf7d0` | Verified status border (Emerald 200) |
| `--email-warning-text` | `#b45309` | 15-minute expiration notice text (Amber 700) |
| `--email-warning-bg` | `#fffbeb` | Expiration warning background (Amber 50) |
| `--email-warning-border` | `#fef3c7` | Expiration warning border (Amber 200) |

---

## 4. Dark Mode (`@media (prefers-color-scheme: dark)`)

| Token Name | Hex Code | Description / Usage |
| :-- | :-- | :-- |
| `--email-bg-dark` | `#0b0f19` | Dark viewport background |
| `--email-card-dark` | `#111827` | Dark card container background (Gray 900) |
| `--email-border-dark` | `#1f2937` | Dark card borders (Gray 800) |
| `--email-text-title-dark` | `#f9fafb` | Headings in dark mode (Gray 50) |
| `--email-text-body-dark` | `#d1d5db` | Body text in dark mode (Gray 300) |
| `--email-text-muted-dark` | `#9ca3af` | Secondary labels in dark mode (Gray 400) |
| `--email-box-dark` | `#1e293b` | Highlight boxes in dark mode (Slate 800) |
| `--email-box-border-dark` | `#334155` | Highlight box borders in dark mode (Slate 700) |

---

## 5. JSON Format

```json
{
  "brand": {
    "primary": "#2563eb",
    "primaryHover": "#1d4ed8",
    "primaryText": "#ffffff",
    "accent": "#0284c7",
    "badgeBg": "#e0f2fe",
    "badgeBorder": "#bae6fd"
  },
  "light": {
    "bgBody": "#f8fafc",
    "bgCard": "#ffffff",
    "border": "#e2e8f0",
    "boxSubtle": "#f1f5f9",
    "textTitle": "#0f172a",
    "textBody": "#334155",
    "textMuted": "#64748b"
  },
  "semantic": {
    "success": "#047857",
    "successBg": "#f0fdf4",
    "successBorder": "#bbf7d0",
    "warning": "#b45309",
    "warningBg": "#fffbeb",
    "warningBorder": "#fef3c7"
  },
  "dark": {
    "bgBody": "#0b0f19",
    "bgCard": "#111827",
    "border": "#1f2937",
    "textTitle": "#f9fafb",
    "textBody": "#d1d5db",
    "textMuted": "#9ca3af",
    "boxBg": "#1e293b",
    "boxBorder": "#334155"
  }
}
```
