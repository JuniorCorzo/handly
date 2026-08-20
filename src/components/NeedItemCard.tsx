"use client";

import Link from "next/link";
import { useState } from "react";

import { PledgeModal } from "@/features/pledges/components/PledgeModal";
import type { UrgencyLevel } from "@/lib/validations/need-item";

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
  urgency: UrgencyLevel;
  target_quantity: number;
  committed_quantity: number;
  remaining_quantity: number;
  progress_percentage: number;
  is_fulfilled: boolean;
  org_name?: string;
  campaign_id?: string | null;
  campaign_name?: string;
  collection_points: PublicCollectionPoint[];
}

interface NeedItemCardProps {
  item: PublicNeedItem;
  /** When false, the campaign tag/link is hidden (used on the campaign page itself). */
  showCampaignTag?: boolean;
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

export function NeedItemCard({
  item,
  showCampaignTag = true,
}: NeedItemCardProps) {
  const [activeItem, setActiveItem] = useState<PublicNeedItem | null>(null);

  const urgency = URGENCY_CONFIG[item.urgency] ?? {
    label: item.urgency,
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-400",
  };

  const progressColor = getProgressColor(item.progress_percentage);

  return (
    <>
      <div
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
              <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          </div>

          {/* Título y Organización */}
          <h3 className="text-lg leading-snug font-bold text-[var(--ink)]">
            {item.item_name}
          </h3>

          {showCampaignTag && item.campaign_name && item.campaign_id && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Campaña:{" "}
              <Link
                href={`/campaign/${item.campaign_id}`}
                className="font-medium text-[var(--ink)] underline decoration-[var(--muted)]/30 underline-offset-2 hover:decoration-[var(--ink)]/50"
              >
                {item.campaign_name}
              </Link>
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

        {/* Botón de Acción / Footer */}
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
    </>
  );
}
