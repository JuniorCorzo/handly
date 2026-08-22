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
      "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/30",
    dot: "bg-[var(--critical)] animate-pulse",
  },
  urgent_12h: {
    label: "Urgente (12h)",
    badge:
      "bg-[var(--urgent)]/10 text-[var(--urgent)] border-[var(--urgent)]/30",
    dot: "bg-[var(--urgent)]",
  },
  standard_24h: {
    label: "Estándar (24h)",
    badge:
      "bg-[var(--standard)]/10 text-[var(--standard)] border-[var(--standard)]/30",
    dot: "bg-[var(--standard)]",
  },
};

function getProgressColor(progress: number): string {
  if (progress >= 100) {
    return "bg-[var(--success)]";
  }
  if (progress >= 50) {
    return "bg-[var(--primary)]";
  }
  return "bg-[var(--urgent)]";
}

export function NeedItemCard({
  item,
  showCampaignTag = true,
}: NeedItemCardProps) {
  const [activeItem, setActiveItem] = useState<PublicNeedItem | null>(null);

  const urgency = URGENCY_CONFIG[item.urgency] ?? {
    label: item.urgency,
    badge: "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]",
    dot: "bg-[var(--muted)]",
  };

  const progressColor = getProgressColor(item.progress_percentage);

  return (
    <>
      <div
        className={`flex flex-col justify-between rounded-[var(--radius-md)] border bg-[var(--surface)] p-5 shadow-2xs transition-all hover:shadow-xs sm:p-6 ${
          item.is_fulfilled
            ? "border-[var(--success)]/30 bg-[var(--success)]/5"
            : "border-[var(--border)]"
        }`}
      >
        <div>
          {/* Header de la Tarjeta */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <span className="inline-flex items-center rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
              {item.category}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-semibold ${urgency.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </span>
          </div>

          {/* Título y Organización */}
          <h3 className="text-base leading-snug font-bold text-[var(--ink)] sm:text-lg">
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
          <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-3.5 sm:mt-5 sm:p-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--ink)]">
                Comprometido:
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
                className={`h-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${item.progress_percentage}%` }}
              />
            </div>

            {/* Números exactos */}
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-1 text-xs">
              <div>
                <span className="text-[var(--muted)]">Donado: </span>
                <strong className="font-mono text-xs text-[var(--ink)] sm:text-sm">
                  {item.committed_quantity}
                </strong>
                <span className="text-[var(--muted)]">
                  {" "}
                  / {item.target_quantity} {item.unit}
                </span>
              </div>
              <div>
                {item.is_fulfilled ? (
                  <span className="font-semibold text-[var(--success)]">
                    ¡Meta cubierta! 🎉
                  </span>
                ) : (
                  <span className="font-medium text-[var(--urgent)]">
                    Faltan {item.remaining_quantity} {item.unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Puntos de Acopio */}
          {item.collection_points.length > 0 && (
            <div className="mt-3 text-xs text-[var(--muted)] sm:mt-4">
              <p className="mb-1 flex items-center gap-1 font-medium text-[var(--ink)]">
                <span>📍</span> Centros de recepción (
                {item.collection_points.length}):
              </p>
              <ul className="flex flex-col gap-1 border-l-2 border-[var(--border)] pl-3 sm:pl-4">
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
        <div className="mt-5 border-t border-[var(--border)] pt-4 sm:mt-6">
          {item.is_fulfilled ? (
            <div className="flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--success)]/40 bg-[var(--success)]/10 py-2.5 text-xs font-bold text-[var(--success)]">
              ✓ Insumo 100% Cubierto
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveItem(item)}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            >
              <span>🤝</span> Donar / Comprometer
            </button>
          )}
        </div>
      </div>

      {/* Modal de Donación */}
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
