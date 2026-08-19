import type { UrgencyLevel } from "@/lib/validations/need-item";

export type UrgencyToken = "critical" | "urgent" | "standard";

export interface UrgencyMeta {
  /** Etiqueta legible para humanos, ej. "Crítico". */
  label: string;
  /** Etiqueta de vencimiento, ej. "Vence en 4 h". */
  ttlLabel: string;
  /** Peso de ordenamiento: menor primero (crítico < urgente < estándar). */
  weight: number;
  /** Token de urgencia → variable CSS de color. */
  token: UrgencyToken;
  /** Referencia al CSS var, ej. "var(--critical)". */
  colorToken: string;
}

export const URGENCY_META: Record<UrgencyLevel, UrgencyMeta> = {
  critical_4h: {
    label: "Crítico",
    ttlLabel: "Vence en 4 h",
    weight: 0,
    token: "critical",
    colorToken: "var(--critical)",
  },
  urgent_12h: {
    label: "Urgente",
    ttlLabel: "Vence en 12 h",
    weight: 1,
    token: "urgent",
    colorToken: "var(--urgent)",
  },
  standard_24h: {
    label: "Estándar",
    ttlLabel: "Vence en 24 h",
    weight: 2,
    token: "standard",
    colorToken: "var(--standard)",
  },
};

/**
 * Ordena por urgencia: crítico → urgente → estándar.
 * El peso es la primera clave de orden (Non-Color Urgency Rule: el orden
 * nunca depende del color).
 */
export function sortByUrgency<T extends { urgency: UrgencyLevel }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => URGENCY_META[a.urgency].weight - URGENCY_META[b.urgency].weight
  );
}
