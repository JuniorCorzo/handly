# Handly — Índice Stitch (Propuesta B)

> Fuente: `stitch_coderhub_design_system/` (raw externo, ignorado por `.gitignore`). Este índice es la referencia operativa serena en español neutro. El nombre histórico `coderhub` se renombra a `handly` en todo artefacto nuevo.

## Auditoría previa (bloqueantes resueltos)

- 9/9 mockups en inglés → traducidos 100 % a español neutro en componentes.
- Drift tokens: `primary #004341` → `oklch(0.431 0.07 191)` / `#0F5C59`, `background #eefdf6` → `oklch(0.9815 0.005 165)` / `#F6FAF8`.
- Grid fijo (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) → `repeat(auto-fit, minmax(280px, 1fr))`.
- Side-stripe `w-1` en notificaciones → badge pill + icon.
- Tailwind CDN + Google Fonts links → eliminado; Tailwind 4 `@theme inline` + `next/font` Geist.
- Blur glass (`backdrop-blur`, `blur-[1px]`) → scrim opaco `bg-ink/40`.
- Map Fase 2: placeholder sin navegación MVP, import dinámico diferido.

## Mapa mockup → ruta → componente

| # | Mockup (raw `stitch_coderhub_design_system/`) | Ruta `docs/design/stitch/` | Ruta `app/` propuesta | Componente `src/components/stitch/` | Estado traducción |
|---|-----------------------------------------------|-----------------------------|-----------------------|--------------------------------------|-------------------|
| 01 | `guest_onboarding/` (`code.html` + `screen.png`) | `01-guest_onboarding/` | `app/page.tsx` (hero + ancla `#como-funciona`) + `app/(public)/bienvenida/page.tsx` si onboarding dedicado | `OnboardingSteps.tsx` | ✅ ES neutro — “Escaneá necesidades” → “Explorá necesidades”, “Pledge Items” → “Comprometete con insumos”, “Drop Off” → “Entregá en el centro” |
| 02 | `needs_catalog/` | `02-needs_catalog/` | `app/needs/page.tsx` (público donante); `app/dashboard/needs/*` queda para organizaciones | `NeedCard.tsx`, `NeedGrid.tsx`, `NeedFilters.tsx` | ✅ “Needs Today” → “Necesidades hoy”, “Pledge to Help” → “Comprometerse”, “Quantity Needed” → “Cantidad necesaria”, “Location” → “Zona” |
| 03 | `pledge_dialog/` | `03-pledge_dialog/` | Intercepting route `app/needs/@modal/(.)pledge/[id]/page.tsx` + `app/needs/[id]/pledge/page.tsx` fallback | `PledgeDialog.tsx`, `SOSBadge.tsx` | ✅ “Pledge Quantity” → “Cantidad a comprometer”, “Confirm Pledge” → “Confirmar compromiso”, “Delivery required to…” → “Entrega en…” |
| 04 | `pledge_receipt_operational/` | `04-pledge_receipt_operational/` | `app/pledges/[id]/page.tsx` (fusionado con 07) | `PledgeReceipt.tsx` (fusiona 04 + 07), `SOSBadge.tsx` | ✅ “Pledge Confirmed” → “Compromiso confirmado”, “Awaiting Delivery” → “Pendiente de entrega”, “Manifest” → “Detalle”, “Logistics” → “Logística” |
| 05 | `map_view/` | `05-map_view/` | `app/map/page.tsx` — **Fase 2** (deferred `next/dynamic`, no en nav MVP) | `MapView.tsx` | ✅ “Search locations or zones…” → “Buscar zonas o centros…”, “Navigate to Center” → “Cómo llegar” |
| 06 | `donor_profile/` | `06-donor_profile/` | `app/(donor)/perfil/page.tsx` | Reusa `PledgeReceipt.tsx` + `SOSBadge.tsx` (lista “Mis compromisos”) | ✅ “Donor Profile” → “Perfil del donante”, “Total Pledges” → “Compromisos totales”, “Ready for Drop-off” → “Listo para entregar” |
| 07 | `donation_confirmed_success/` | `07-donation_confirmed_success/` | Fusionado en `app/pledges/[id]/page.tsx` (estado `success`) | `PledgeReceipt.tsx` (variante success) | ✅ “Impact Confirmed” → “Entrega confirmada”, “Return to Needs” → “Volver a necesidades”, “View Profile” → “Ver perfil” |
| 08 | `notifications/` | `08-notifications/` | `app/notifications/page.tsx` | `NotificationItem.tsx` + `NeedFilters.tsx` (filtros) | ✅ “Notifications” → “Notificaciones”, “Urgent Need in Zone 7A” → “Necesidad urgente en Zona 7A”, “Pledge Reminder” → “Recordatorio de compromiso” — **sin** `w-1` side-stripe |
| 09 | `settings/` | `09-settings/` | `app/settings/page.tsx` | `SettingsSection.tsx`, `ThemePicker.tsx` | ✅ Header bug fix: “Donor Profile” → “Configuración”, “Appearance” → “Apariencia”, “Claro / Oscuro / Sistema”, “Support” → “Ayuda” |
| 10 | `calm_operational/DESIGN.md` | `10-calm_operational/DESIGN.md` | — (doc fundacional, no ruta) | Tokens en `src/styles/globals.css` | — Owner file canónico OKLCH, teal ≤10 %, Restrained, Geist only |

## Decisiones documentadas

- **Ubicación componentes:** `src/components/stitch/` (no `src/components/ui/stitch/`) — `ui/` queda para primitivas shadcn genéricas; `stitch/` agrupa la traducción fiel de los mockups con tokens canónicos. Consistente en todo el repo.
- **Map Fase 2:** `MapView.tsx` exporta placeholder con `next/image` y `dynamic(() => import(...), { ssr: false })` diferido. Input de búsqueda con `label.sr-only`. No se expone en `app/page.tsx` ni `app/dashboard/*` hasta tener proveedor de mapas. Evita bundle y permisos de geolocalización en MVP.
- **Fusión 04 + 07:** `PledgeReceipt.tsx` evita duplicar “Delivery Details / Status / Manifest / Logistics”. Prop `variant?: 'operational' | 'success'` controla el encabezado. Un único `app/pledges/[id]/page.tsx` cubre ambos estados.
- **Iconografía:** Tabler/lucide 1.75px stroke, una familia. Se usan SVG inline sin dependencia extra (evita `lucide-react` hasta que el design system lo exija) — misma métrica, sin CDN.
- **Timestamps:** `NotificationItem.tsx` usa `Intl.DateTimeFormat` con `es-AR` y `date-fns` como mejora progresiva opcional (no dependencia obligatoria) — mantiene ES neutro sin añadir peso si `date-fns` no está instalado.
- **PledgeDialog scrim:** `bg-ink/40` opaco, sin `backdrop-blur` ni `glassmorphism`. `role="dialog"` + `aria-modal` + focus trap vía `<dialog>` nativo.
- **Grid:** `NeedGrid.tsx` usa `grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` (Tailwind arbitrary) con `gap-6` (24px). Padre controla el layout; `NeedCard.tsx` es agnóstico al grid.

## Traducciones clave (ES neutro, operativa serena)

| EN (Stitch raw) | ES (componente) |
|-----------------|-----------------|
| Needs Today | Necesidades hoy |
| Critical | Crítico |
| Urgent | Urgente |
| Standard | Estándar |
| Pledge to Help / Pledge Now | Comprometerse |
| Quantity Needed | Cantidad necesaria |
| Location | Zona |
| Fulfillment | Avance |
| Pledge Quantity | Cantidad a comprometer |
| Confirm Pledge | Confirmar compromiso |
| Delivery required to… | Entrega en… |
| Intake Verification Code | Código de verificación |
| Copy Code | Copiar código |
| Open Map / Navigate to Center | Abrir mapa / Cómo llegar |
| Need Assistance? | ¿Necesitás ayuda? |
| Impact Confirmed | Entrega confirmada |
| Return to Needs | Volver a necesidades |
| Notifications | Notificaciones |
| Donor Profile | Perfil del donante (settings: Configuración) |
| Appearance — Light / Dark / System | Apariencia — Claro / Oscuro / Sistema |
| Search locations or zones… | Buscar zonas o centros… |

