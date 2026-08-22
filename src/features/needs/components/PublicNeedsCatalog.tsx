"use client";

import Link from "next/link";

import { NeedItemCard } from "@/components/NeedItemCard";
import type { PublicNeedItem } from "@/components/NeedItemCard";

import { useNeedsFilters } from "../hooks/useNeedsFilters";

interface PublicNeedsCatalogProps {
  items: PublicNeedItem[];
  limit?: number;
  showFilters?: boolean;
  title?: string;
  description?: string;
  showViewAllLink?: boolean;
  viewAllHref?: string;
}

export function PublicNeedsCatalog({
  items,
  limit,
  showFilters = true,
  title = "Catálogo Público de Necesidades Urgentes",
  description = "Conocé el avance de recaudación en vivo y sumá tu compromiso directo.",
  showViewAllLink = false,
  viewAllHref = "/needs",
}: PublicNeedsCatalogProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedUrgency,
    setSelectedUrgency,
    selectedCategory,
    setSelectedCategory,
    selectedCoverage,
    setSelectedCoverage,
    availableCategories,
    filteredItems,
    hasActiveFilters,
    resetFilters,
  } = useNeedsFilters({ items });

  const displayedItems = limit ? filteredItems.slice(0, limit) : filteredItems;

  return (
    <section id="catalogo" className="py-10 sm:py-16">
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* ── Encabezado ───────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
                <span className="h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
                Territorio en Tiempo Real
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
                {title}
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                {description}
              </p>
            </div>

            {/* Contador de resultados */}
            <div className="text-xs font-medium text-[var(--muted)]">
              Mostrando{" "}
              <strong className="text-[var(--ink)]">
                {displayedItems.length}
              </strong>{" "}
              de <strong className="text-[var(--ink)]">{items.length}</strong>{" "}
              requerimientos
            </div>
          </div>

          {/* ── Barra de Filtros Multifaceta ───────────────────────── */}
          {showFilters && (
            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-2xs sm:p-4">
              {/* Input de Búsqueda */}
              <div className="relative w-full">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-xs text-[var(--muted)]">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por insumo, campaña u organización..."
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] py-2.5 pr-10 pl-9 text-xs text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none sm:text-sm"
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
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[var(--border)]/60 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filtro Urgencia */}
                  <div className="flex flex-wrap items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-1">
                    <button
                      type="button"
                      onClick={() => setSelectedUrgency("all")}
                      className={`min-h-[32px] rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedUrgency === "all"
                          ? "bg-[var(--primary)] text-white"
                          : "text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUrgency("critical_4h")}
                      className={`flex min-h-[32px] items-center gap-1 rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedUrgency === "critical_4h"
                          ? "bg-[var(--critical)] text-white"
                          : "text-[var(--critical)] hover:bg-[var(--critical)]/10"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--critical)]" />
                      Crítico 4h
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUrgency("urgent_12h")}
                      className={`min-h-[32px] rounded-[var(--radius-xs)] px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedUrgency === "urgent_12h"
                          ? "bg-[var(--urgent)] text-white"
                          : "text-[var(--urgent)] hover:bg-[var(--urgent)]/10"
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
                      className="min-h-[36px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
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
                    className="min-h-[36px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
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
                    onClick={resetFilters}
                    className="text-xs font-semibold text-[var(--primary)] underline underline-offset-2 hover:opacity-80"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Grilla de Tarjetas de Requerimientos ─────────────────── */}
        {displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center sm:p-12">
            <span className="mb-2 text-3xl">📦</span>
            <h3 className="text-sm font-semibold text-[var(--ink)] sm:text-base">
              No se encontraron requerimientos
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[var(--muted)]">
              No hay necesidades activas que coincidan con los filtros
              seleccionados.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Ver todos los requerimientos
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {displayedItems.map((item) => (
              <NeedItemCard key={item.id} item={item} showCampaignTag={true} />
            ))}
          </div>
        )}

        {/* ── Botón / Banner "Ver Todos los Insumos" para Vista Previa ── */}
        {showViewAllLink && (
          <div className="flex flex-col items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-center shadow-2xs sm:flex-row sm:p-6 sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-[var(--ink)]">
                ¿Buscás otros elementos o querés filtrar por zona?
              </h4>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Consultá la lista completa de {items.length} requerimientos en
                nuestro catálogo público dedicado.
              </p>
            </div>
            <Link
              href={viewAllHref}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white shadow-2xs transition-opacity hover:opacity-90 focus:outline-none sm:text-sm"
            >
              <span>Ver todos los insumos ({items.length})</span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
