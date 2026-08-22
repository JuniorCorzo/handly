import { NeedItemErrorCode } from "@/lib/validations/need-item";

import type { NeedStatus, UrgencyLevel } from "../types";

const LABEL_CRITICAL = "Crítico (4h)";
const LABEL_URGENT = "Urgente (12h)";
const LABEL_STANDARD = "Estándar (24h)";
const LABEL_ACTIVE = "Activo";

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critical_4h: LABEL_CRITICAL,
  urgent_12h: LABEL_URGENT,
  standard_24h: LABEL_STANDARD,
};

export const URGENCY_OPTIONS = [
  { label: LABEL_CRITICAL, value: "critical_4h" },
  { label: LABEL_URGENT, value: "urgent_12h" },
  { label: LABEL_STANDARD, value: "standard_24h" },
] as const;

export const STATUS_OPTIONS = [
  { label: LABEL_ACTIVE, value: "active" },
  { label: "Completado", value: "fulfilled" },
  { label: "Cancelado", value: "cancelled" },
] as const;

export const URGENCY_MAP: Record<
  UrgencyLevel,
  { label: string; className: string }
> = {
  critical_4h: {
    label: LABEL_CRITICAL,
    className:
      "bg-[var(--critical)]/10 text-[var(--critical)] border-[var(--critical)]/30",
  },
  urgent_12h: {
    label: LABEL_URGENT,
    className:
      "bg-[var(--urgent)]/10 text-[var(--urgent)] border-[var(--urgent)]/30",
  },
  standard_24h: {
    label: LABEL_STANDARD,
    className:
      "bg-[var(--standard)]/10 text-[var(--standard)] border-[var(--standard)]/30",
  },
};

export const STATUS_MAP: Record<
  NeedStatus,
  { label: string; className: string }
> = {
  active: {
    label: LABEL_ACTIVE,
    className:
      "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30",
  },
  fulfilled: {
    label: "Completado",
    className:
      "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]",
  },
};

export const NEED_ITEM_MESSAGES: Record<string, string> = {
  [NeedItemErrorCode.CAMPAIGN_REQUIRED]: "Seleccioná una campaña válida.",
  [NeedItemErrorCode.CATEGORY_REQUIRED]: "La categoría es obligatoria.",
  [NeedItemErrorCode.CATEGORY_TOO_LONG]:
    "La categoría no puede superar los 100 caracteres.",
  [NeedItemErrorCode.ITEM_NAME_REQUIRED]: "El nombre del ítem es obligatorio.",
  [NeedItemErrorCode.ITEM_NAME_TOO_LONG]:
    "El nombre no puede superar los 255 caracteres.",
  [NeedItemErrorCode.QUANTITY_POSITIVE]:
    "La cantidad debe ser un número positivo.",
  [NeedItemErrorCode.UNIT_REQUIRED]: "La unidad es obligatoria.",
  [NeedItemErrorCode.UNIT_TOO_LONG]:
    "La unidad no puede superar los 50 caracteres.",
  [NeedItemErrorCode.URGENCY_INVALID]:
    "Seleccioná un nivel de urgencia válido.",
  [NeedItemErrorCode.COLLECTION_POINTS_REQUIRED]:
    "Seleccioná al menos un centro de acopio.",
  [NeedItemErrorCode.CREATE_FAILED]:
    "No se pudo crear el ítem. Intentá de nuevo.",
  [NeedItemErrorCode.UPDATE_FAILED]:
    "No se pudo actualizar el ítem. Intentá de nuevo.",
  [NeedItemErrorCode.PIVOT_LINK_FAILED]:
    "No se pudo vincular los centros de acopio. Intentá de nuevo.",
};

export function getNeedItemErrorMessage(code: string): string {
  return NEED_ITEM_MESSAGES[code] ?? code;
}
