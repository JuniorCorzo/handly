import Image from "next/image";

export type MapViewProps = {
  query?: string;
  onQueryChange?: (v: string) => void;
  centerLabel?: string;
  zoneCode?: string;
  needsSummary?: string;
  onNavigate?: () => void;
};

// Fase 2 — placeholder sin proveedor de mapas.
// Usa next/image para el fondo, no en nav MVP, import dinámico diferido por el consumidor.

export function MapView({
  query = "",
  onQueryChange,
  centerLabel = "Centro de recepción Norte",
  zoneCode = "ZONA-7A",
  needsSummary = "Fórmula infantil",
  onNavigate,
}: MapViewProps) {
  return (
    <div className="relative flex h-[min(70dvh,720px)] w-full flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="absolute top-4 right-4 left-4 z-10 md:left-1/2 md:w-[min(480px,calc(100%-32px))] md:-translate-x-1/2">
        <label htmlFor="map-search" className="sr-only">
          Buscar zonas o centros
        </label>
        <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)]">
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="shrink-0 text-[var(--muted)]"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            id="map-search"
            type="search"
            placeholder="Buscar zonas o centros…"
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            className="w-full bg-transparent p-0 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
          />
        </div>
      </div>

      <div className="relative h-full w-full bg-[var(--background)]">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIYZMuspCJs8gFIExCDgYgFFaAeDKLXyO2QDbeBuAAEzO3CPXxxvuqqi3dmtDWoHk8FmyEv5lNwdJg_v-OGfSNsVAYJFNd7E_abrV7tTW_dqMzsTJ3aHo9e3avZSveZzZJFWld2b1E5-DDPbylPHTSIGJzXUtWGwq0L-hywo6nm-XlU9Ej-jYHECUqU2uZmJng0epIKklCpipxkylgzrs_8BUq9DzD-bwzWcrG5pWwSNs6n5havg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover opacity-70"
          unoptimized
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--surface)] bg-[var(--primary)] text-[var(--surface)] shadow"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <p className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)] shadow">
          Mapa — Fase 2 · Vista previa no navegable
        </p>
      </div>

      <div className="absolute right-4 bottom-4 left-4 z-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_4px_12px_oklch(0.23_0.02_173/0.10)] md:left-1/2 md:w-[min(480px,calc(100%-32px))] md:-translate-x-1/2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              {centerLabel}
            </h3>
            <p className="font-mono text-xs text-[var(--muted)]">{zoneCode}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--success)]/20 bg-[var(--success)]/10 px-2 py-1 text-xs font-semibold text-[var(--success)]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[var(--success)]"
            />
            Abierto
          </span>
        </div>
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <p className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
            Necesidad crítica asociada
          </p>
          <p className="mt-1 text-sm text-[var(--ink)]">{needsSummary}</p>
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
          Cómo llegar
        </button>
      </div>
    </div>
  );
}
