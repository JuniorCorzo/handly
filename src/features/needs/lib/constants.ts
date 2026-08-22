import { NeedItemErrorCode } from "@/lib/validations/need-item";

import type { UrgencyLevel, NeedStatus } from "../types";

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  critical_4h: "Crítico (4h)",
  urgent_12h: "Urgente (12h)",
  standard_24h: "Estándar (24h)",
};

export const URGENCY_OPTIONS = [
  { label: "Crítico (4h)", value: "critical_4h" },
  { label: "Urgente (12h)", value: "urgent_12h" },
  { label: "Estándar (24h)", value: "standard_24h" },
] as const;

export const STATUS_OPTIONS = [
  { label: "Activo", value: "active" },
  { label: "Completado", value: "fulfilled" },
  { label: "Cancelado", value: "cancelled" },
] as const;

export const URGENCY_MAP: Record<
  UrgencyLevel,
  { label: string; className: string }
> = {
  critical_4h: {
    label: "Crítico (4h)",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  urgent_12h: {
    label: "Urgente (12h)",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  standard_24h: {
    label: "Estándar (24h)",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export const STATUS_MAP: Record<
  NeedStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  fulfilled: {
    label: "Completado",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-700 border-gray-200",
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
