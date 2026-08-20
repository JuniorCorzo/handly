"use client";

import { useState } from "react";

import { NeedItemCard } from "@/components/NeedItemCard";
import type { PublicNeedItem } from "@/components/NeedItemCard";

interface PublicNeedsCatalogProps {
  items: PublicNeedItem[];
}

export function PublicNeedsCatalog({ items }: PublicNeedsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCoverage, setSelectedCoverage] = useState<string>("all");

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
            {filteredItems.map((item) => (
              <NeedItemCard key={item.id} item={item} showCampaignTag={true} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
