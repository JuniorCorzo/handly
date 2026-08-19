import { z } from "zod";

// ── Códigos de Error: Única fuente de verdad ────────────────────────
export const PledgeErrorCode = {
  NEED_ITEM_REQUIRED: "NEED_ITEM_REQUIRED",
  DONOR_NAME_REQUIRED: "DONOR_NAME_REQUIRED",
  DONOR_NAME_TOO_LONG: "DONOR_NAME_TOO_LONG",
  DONOR_EMAIL_REQUIRED: "DONOR_EMAIL_REQUIRED",
  DONOR_EMAIL_INVALID: "DONOR_EMAIL_INVALID",
  QUANTITY_POSITIVE: "QUANTITY_POSITIVE",
  // Excepciones de negocio del RPC
  ITEM_NOT_AVAILABLE: "ITEM_NOT_AVAILABLE",
  INSUFFICIENT_QUOTA_AVAILABLE: "INSUFFICIENT_QUOTA_AVAILABLE",
  PLEDGE_CREATION_FAILED: "PLEDGE_CREATION_FAILED",
} as const;

export type PledgeErrorCodeKey =
  (typeof PledgeErrorCode)[keyof typeof PledgeErrorCode];

// ── Mensajes legibles en español (i18n ready) ───────────────────────
export const PLEDGE_MESSAGES: Record<string, string> = {
  [PledgeErrorCode.NEED_ITEM_REQUIRED]: "El ítem de necesidad es obligatorio.",
  [PledgeErrorCode.DONOR_NAME_REQUIRED]: "Tu nombre es obligatorio.",
  [PledgeErrorCode.DONOR_NAME_TOO_LONG]:
    "El nombre no puede superar los 255 caracteres.",
  [PledgeErrorCode.DONOR_EMAIL_REQUIRED]:
    "Tu correo electrónico es obligatorio.",
  [PledgeErrorCode.DONOR_EMAIL_INVALID]:
    "Ingresá un correo electrónico válido.",
  [PledgeErrorCode.QUANTITY_POSITIVE]: "La cantidad debe ser mayor a 0.",
  [PledgeErrorCode.ITEM_NOT_AVAILABLE]:
    "Este ítem ya no se encuentra disponible o fue completado.",
  [PledgeErrorCode.INSUFFICIENT_QUOTA_AVAILABLE]:
    "La cantidad solicitada supera el cupo restante disponible.",
  [PledgeErrorCode.PLEDGE_CREATION_FAILED]:
    "No se pudo registrar la donación. Por favor, intentá nuevamente.",
};

export function getPledgeErrorMessage(code: string): string {
  return PLEDGE_MESSAGES[code] ?? code;
}

// ── Esquema Zod ─────────────────────────────────────────────────────
export const PledgeSchema = z.object({
  need_item_id: z.uuid(PledgeErrorCode.NEED_ITEM_REQUIRED),
  donor_name: z
    .string()
    .min(1, PledgeErrorCode.DONOR_NAME_REQUIRED)
    .max(255, PledgeErrorCode.DONOR_NAME_TOO_LONG),
  donor_email: z.email(PledgeErrorCode.DONOR_EMAIL_INVALID),
  quantity: z.coerce.number().int().positive(PledgeErrorCode.QUANTITY_POSITIVE),
});

export type PledgeInput = z.infer<typeof PledgeSchema>;

export interface PledgeResult {
  id: string;
  short_code: string;
  need_item_id: string;
  donor_name: string;
  donor_email: string;
  quantity: number;
  status: "pending" | "received" | "cancelled";
  expires_at: string;
  available_quota_remaining: number;
}
