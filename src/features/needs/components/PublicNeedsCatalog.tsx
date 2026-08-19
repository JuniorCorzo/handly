"use client";

import { useState } from "react";

import { PledgeModal } from "@/src/features/pledges/components/PledgeModal";

export interface PublicCollectionPoint {
  id: string;
  location_adress: string;
  open_time?: string | null;
  close_time?: string | null;
}

export interface PublicNeedItem {
  id: string;
  item_name: string;
  category: string;
  unit: string;
  urgency: "critical_4h" | "urgent_12h" | "standard_24h" | string;
  target_quantity: number;
  committed_quantity: number;
  remaining_quantity: number;
  progress_percentage: number;
  is_fulfilled: boolean;
  org_name?: string;
  campaign_name?: string;
  collection_points: PublicCollectionPoint[];
}

interface PublicNeedsCatalogProps {
  items: PublicNeedItem[];
}

const URGENCY_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  critical_4h: {
    label: "Crítico (4h)",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dot: "bg-rose-500 animate-pulse",
  },
  urgent_12h: {
    label: "Urgente (12h)",
    badge:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  standard_24h: {
    label: "Estándar (24h)",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    dot: "bg-blue-500",
  },
};

function getProgressColor(progress: number): string {
  if (progress >= 100) {
    return "bg-emerald-500";
  }
  if (progress >= 50) {
    return "bg-[var(--primary)]";
  }
  return "bg-amber-500";
}

export function PublicNeedsCatalog({ items }: PublicNeedsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("all");
  const [activeItem, setActiveItem] = useState<PublicNeedItem | null>(null);

  // Extraer categorías únicas disponibles
  const categorySet = new Set<string>();
  for (const item of items) {
    if (item.category) {
      categorySet.add(item.category);
    }
  }
  const availableCategories = [...categorySet].toSorted();

  // Filtrar ítems en tiempo real
  const filteredItems = items.filter((item) => {
    // 1. Filtro de búsqueda por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = item.item_name.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      const matchOrg = (item.org_name || "").toLowerCase().includes(query);
      const matchCamp = (item.campaign_name || "")
        .toLowerCase()
        .includes(query);
      if (!matchName && !matchCat && !matchOrg && !matchCamp) {
        return false;
      }
    }

    // 2. Filtro de urgencia
    if (selectedUrgency !== "all" && item.urgency !== selectedUrgency) {
      return false;
    }

    // 3. Filtro de categoría
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }

    // 4. Filtro de cobertura
    if (
      selectedCoverage === "urgent_uncovered" &&
      item.progress_percentage >= 50
    ) {
      return false;
    }
    if (
      selectedCoverage === "in_progress" &&
      (item.progress_percentage < 50 || item.progress_percentage >= 100)
    ) {
      return false;
    }
    if (selectedCoverage === "fulfilled" && !item.is_fulfilled) {
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedUrgency !== "all" ||
    selectedCategory !== "all" ||
    selectedCoverage !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedUrgency("all");
    setSelectedCategory("all");
    setSelectedCoverage("all");
  };

  return (
    <section id="catalogo" className="py-12 sm:py-16">
      <div className="flex flex-col gap-8">
        {/* ── Encabezado y Barra de Búsqueda ───────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
                <span className="h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
                Territorio en Tiempo Real
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
                Catálogo Público de Necesidades Urgentes
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Conocé el avance de recaudación en vivo y sumá tu compromiso
                directo.
              </p>
            </div>

            {/* Contador de resultados */}
            <div className="text-xs font-medium text-[var(--muted)]">
              Mostrando{" "}
              <strong className="text-[var(--ink)]">
                {filteredItems.length}
              </strong>{" "}
              de <strong className="text-[var(--ink)]">{items.length}</strong>{" "}
              requerimientos
            </div>
          </div>

          {/* ── Barra de Filtros Multifaceta ───────────────────────── */}
          <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
            {/* Input de Búsqueda */}
            <div className="relative w-full">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-[var(--muted)]">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por insumo (ej: Agua, Frazadas), campaña u organización..."
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] py-2.5 pr-10 pl-10 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Fila de Filtros Rápidos */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)]/60 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro Urgencia */}
                <div className="flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedUrgency("all")}
                    className={`rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedUrgency === "all"
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    Todas Urgencias
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUrgency("critical_4h")}
                    className={`flex items-center gap-1 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedUrgency === "critical_4h"
                        ? "bg-rose-600 text-white"
                        : "text-rose-700 hover:bg-rose-50"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    Crítico 4h
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUrgency("urgent_12h")}
                    className={`rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedUrgency === "urgent_12h"
                        ? "bg-amber-600 text-white"
                        : "text-amber-800 hover:bg-amber-50"
                    }`}
                  >
                    Urgente 12h
                  </button>
                </div>

                {/* Dropdown Categoría */}
                {availableCategories.length > 0 && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                  >
                    <option value="all">Todas las Categorías</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}

                {/* Dropdown Cobertura */}
                <select
                  value={selectedCoverage}
                  onChange={(e) => setSelectedCoverage(e.target.value)}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                >
                  <option value="all">Todos los estados</option>
                  <option value="urgent_uncovered">
                    Falta cubrir (&lt;50%)
                  </option>
                  <option value="in_progress">En progreso (&gt;50%)</option>
                  <option value="fulfilled">Completados (100%)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Grilla de Tarjetas de Requerimientos ─────────────────── */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <span className="mb-2 text-3xl">📦</span>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              No se encontraron requerimientos
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
              No hay necesidades activas que coincidan con los filtros
              seleccionados.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Ver todos los requerimientos
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const urgency = URGENCY_CONFIG[item.urgency] ?? {
                label: item.urgency,
                badge: "bg-gray-100 text-gray-700 border-gray-200",
                dot: "bg-gray-400",
              };

              const progressColor = getProgressColor(item.progress_percentage);

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-[var(--radius-md)] border bg-[var(--surface)] p-6 shadow-xs transition-shadow hover:shadow-md ${
                    item.is_fulfilled
                      ? "border-emerald-200/80 bg-emerald-50/10"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div>
                    {/* Header de la Tarjeta */}
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className="inline-flex items-center rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[var(--muted)] uppercase">
                        {item.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11px] font-semibold ${urgency.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`}
                        />
                        {urgency.label}
                      </span>
                    </div>

                    {/* Título y Organización */}
                    <h3 className="text-lg leading-snug font-bold text-[var(--ink)]">
                      {item.item_name}
                    </h3>

                    {item.campaign_name && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Campaña:{" "}
                        <strong className="font-medium text-[var(--ink)]">
                          {item.campaign_name}
                        </strong>
                        {item.org_name && <span> · {item.org_name}</span>}
                      </p>
                    )}

                    {/* ── Bloque de Progreso y Compromiso ──────────────── */}
                    <div className="mt-5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--ink)]">
                          Comprometido por la gente:
                        </span>
                        <span className="font-mono font-bold text-[var(--ink)]">
                          {item.progress_percentage}%
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]"
                        role="progressbar"
                        aria-valuenow={item.progress_percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={`h-full transition-colors duration-500 ${progressColor}`}
                          style={{ width: `${item.progress_percentage}%` }}
                        />
                      </div>

                      {/* Números exactos */}
                      <div className="mt-3 flex items-baseline justify-between text-xs">
                        <div>
                          <span className="text-[var(--muted)]">Donado: </span>
                          <strong className="font-mono text-sm text-[var(--ink)]">
                            {item.committed_quantity}
                          </strong>
                          <span className="text-[var(--muted)]">
                            {" "}
                            / {item.target_quantity} {item.unit}
                          </span>
                        </div>
                        <div>
                          {item.is_fulfilled ? (
                            <span className="font-semibold text-emerald-600">
                              ¡Meta cubierta! 🎉
                            </span>
                          ) : (
                            <span className="font-medium text-amber-700">
                              Faltan {item.remaining_quantity} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Puntos de Acopio */}
                    {item.collection_points.length > 0 && (
                      <div className="mt-4 text-xs text-[var(--muted)]">
                        <p className="mb-1 flex items-center gap-1 font-medium text-[var(--ink)]">
                          <span>📍</span> Centros de recepción (
                          {item.collection_points.length}):
                        </p>
                        <ul className="flex flex-col gap-1 border-l-2 border-[var(--border)] pl-4">
                          {item.collection_points.slice(0, 2).map((cp) => (
                            <li
                              key={cp.id}
                              className="truncate"
                              title={cp.location_adress}
                            >
                              {cp.location_adress}
                              {cp.open_time && cp.close_time && (
                                <span className="ml-1 text-xs text-[var(--muted)]">
                                  ({cp.open_time.slice(0, 5)} a{" "}
                                  {cp.close_time.slice(0, 5)} hs)
                                </span>
                              )}
                            </li>
                          ))}
                          {item.collection_points.length > 2 && (
                            <li className="text-xs font-semibold text-[var(--primary)]">
                              +{item.collection_points.length - 2} puntos más
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Botón de Acción */}
                  <div className="mt-6 border-t border-[var(--border)] pt-4">
                    {item.is_fulfilled ? (
                      <div className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-emerald-300 bg-emerald-100/80 py-2.5 text-xs font-bold text-emerald-800">
                        ✓ Insumo 100% Cubierto
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveItem(item)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] py-2.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                      >
                        <span>🤝</span> Donar / Comprometer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Donación */}
      {/* Sugerir el cupo restante */}
      <PledgeModal
        item={
          activeItem
            ? {
                id: activeItem.id,
                item_name: activeItem.item_name,
                category: activeItem.category,
                unit: activeItem.unit,
                urgency: activeItem.urgency,
                target_quantity: activeItem.remaining_quantity,
                campaign_name: activeItem.campaign_name,
                collection_points: activeItem.collection_points.map((cp) => ({
                  id: cp.id,
                  location_adress: cp.location_adress,
                })),
              }
            : null
        }
        onClose={() => setActiveItem(null)}
      />
    </section>
  );
}
