import Link from "next/link";

import { PublicNeedsCatalog } from "@/src/features/needs/components/PublicNeedsCatalog";
import { getPublicNeedItems } from "@/src/features/needs/lib/queries";

export const instant = false;

export default async function Home() {
  const items = await getPublicNeedItems();

  // Métricas de impacto en vivo para el Hero
  const totalRequerimientos = items.length;
  const totalComprometido = items.reduce(
    (acc, it) => acc + it.committed_quantity,
    0
  );
  const promedioCobertura =
    totalRequerimientos > 0
      ? Math.round(
          items.reduce((acc, it) => acc + it.progress_percentage, 0) /
            totalRequerimientos
        )
      : 0;
  const criticosPendientes = items.filter(
    (it) => it.urgency === "critical_4h" && !it.is_fulfilled
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--ink)] antialiased">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--ink)]">
              Handly
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            >
              Acceso Organizaciones
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Section con Métricas de Impacto ───────────────── */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              Coordinación Operativa de Emergencias
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl lg:text-5xl lg:leading-tight">
              Respuesta rápida y directa para donaciones en emergencias.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              Handly conecta necesidades urgentes verificadas en territorio con
              donantes solidarios. Cada aporte se reserva de forma transparente
              y con trazabilidad inmediata.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#catalogo"
                className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--surface)] shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
              >
                Explorar Catálogo de Insumos
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--ink)] shadow-xs transition-colors hover:bg-[var(--background)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
              >
                Conocer cómo funciona
              </a>
            </div>
          </div>

          {/* ── Tarjetas de Métricas en Vivo ─────────────────────── */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
              <span className="text-xs font-medium text-[var(--muted)]">
                Insumos Requeridos
              </span>
              <p className="mt-1 font-mono text-2xl font-bold text-[var(--ink)]">
                {totalRequerimientos}
              </p>
              <span className="text-xs text-[var(--muted)]">
                en territorio activo
              </span>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
              <span className="text-xs font-medium text-[var(--muted)]">
                Total Comprometido
              </span>
              <p className="mt-1 font-mono text-2xl font-bold text-[var(--primary)]">
                {totalComprometido}
              </p>
              <span className="text-xs text-[var(--muted)]">
                unidades donadas
              </span>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
              <span className="text-xs font-medium text-[var(--muted)]">
                Cobertura Promedio
              </span>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-600">
                {promedioCobertura}%
              </p>
              <span className="text-xs text-[var(--muted)]">
                de metas cumplidas
              </span>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xs">
              <span className="text-xs font-medium text-[var(--muted)]">
                Urgencias Críticas (4h)
              </span>
              <p className="mt-1 font-mono text-2xl font-bold text-rose-600">
                {criticosPendientes}
              </p>
              <span className="text-xs text-[var(--muted)]">
                por cubrir de inmediato
              </span>
            </div>
          </div>
        </section>

        {/* ── Catálogo Público de Necesidades con Donaciones ───── */}
        <div className="mx-auto max-w-5xl border-t border-[var(--border)] px-4 sm:px-6">
          <PublicNeedsCatalog items={items} />
        </div>

        {/* ── Pilares / Cómo funciona ──────────────────────────── */}
        <section
          id="como-funciona"
          className="border-t border-[var(--border)] bg-[var(--surface)] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
                Diseñado para la calma en momentos de presión.
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">
                Priorizamos la información crítica y la facilidad de uso desde
                cualquier dispositivo en el lugar de los hechos.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                  01
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">
                  Peticiones en tiempo real
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Las organizaciones publican listados concretos de insumos
                  faltantes en zonas afectadas, con priorización transparente.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                  02
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">
                  Compromiso Donor-First
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Los donantes aseguran el aporte de elementos específicos sin
                  formularios largos ni intermediación monetaria.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
                  03
                </div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">
                  Trazabilidad SOS
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  Cada donación confirmada genera un código único de entrega que
                  garantiza la llegada coordinada al punto de recepción.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 text-xs text-[var(--muted)]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ink)]">Handly</span>
            <span>· Coordinación de Donaciones</span>
          </div>
          <p>© 2026 Handly. Operativa serena en emergencias.</p>
        </div>
      </footer>
    </div>
  );
}
