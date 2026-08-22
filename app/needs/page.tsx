import type { Metadata } from "next";

import { PublicHeader } from "@/components/PublicHeader";
import { PublicNeedsCatalog } from "@/src/features/needs/components/PublicNeedsCatalog";
import { getPublicNeedItems } from "@/src/features/needs/lib/queries";

export const metadata: Metadata = {
  title: "Catálogo de Insumos y Necesidades Urgentes | Handly",
  description:
    "Consultá la lista completa de insumos requeridos en emergencias activas. Filtrá por urgencia, categoría y realizá tu donación directa con trazabilidad.",
};

export const instant = false;

export default async function NeedsLandingPage() {
  const items = await getPublicNeedItems();

  const totalItems = items.length;
  const criticalItems = items.filter(
    (it) => it.urgency === "critical_4h" && !it.is_fulfilled
  ).length;
  const urgentItems = items.filter(
    (it) => it.urgency === "urgent_12h" && !it.is_fulfilled
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--ink)] antialiased">
      {/* ── Responsive Header ───────────────────────────────────── */}
      <PublicHeader />

      {/* ── Hero & Quick Insight Banner ─────────────────────────── */}
      <main className="flex-1">
        <section className="border-b border-[var(--border)] bg-[var(--surface)] py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--primary)] shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                  Actualización en Vivo de Donaciones
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
                  Insumos y Elementos Prioritarios
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] sm:text-sm lg:text-base">
                  Explorá los requerimientos exactos de cada zona afectada,
                  consultá centros de acopio receptores y comprometé tu donación
                  sin intermediarios.
                </p>
              </div>

              {/* Stat summary pills for quick scanning */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-xs shadow-2xs">
                  <span className="font-semibold text-[var(--muted)]">
                    Total requerimientos:
                  </span>
                  <span className="font-mono font-bold text-[var(--ink)]">
                    {totalItems}
                  </span>
                </div>

                {criticalItems > 0 && (
                  <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--critical)]/30 bg-[var(--critical)]/10 px-3.5 py-2 text-xs shadow-2xs">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--critical)]" />
                    <span className="font-semibold text-[var(--critical)]">
                      Críticos (4h):
                    </span>
                    <span className="font-mono font-bold text-[var(--critical)]">
                      {criticalItems}
                    </span>
                  </div>
                )}

                {urgentItems > 0 && (
                  <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--urgent)]/30 bg-[var(--urgent)]/10 px-3.5 py-2 text-xs shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-[var(--urgent)]" />
                    <span className="font-semibold text-[var(--urgent)]">
                      Urgentes (12h):
                    </span>
                    <span className="font-mono font-bold text-[var(--urgent)]">
                      {urgentItems}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Full Catalog Section ──────────────────────────────── */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <PublicNeedsCatalog
            items={items}
            showFilters={true}
            title="Catálogo Operativo de Necesidades"
            description="Buscá y filtrá por insumo, campaña o urgencia para realizar tu compromiso."
          />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 text-xs text-[var(--muted)]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ink)]">Handly</span>
            <span>· Coordinación de Donaciones en Territorio</span>
          </div>
          <p>© 2026 Handly. Trazabilidad directa en emergencias.</p>
        </div>
      </footer>
    </div>
  );
}
