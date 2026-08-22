import { z } from "zod";

// ── Códigos de Error de Recepción e Intake ────────────────────────────
export const IntakeErrorCode = {
  CODE_REQUIRED: "CODE_REQUIRED",
  CODE_INVALID_FORMAT: "CODE_INVALID_FORMAT",
  PLEDGE_NOT_FOUND: "PLEDGE_NOT_FOUND",
  PLEDGE_ALREADY_RECEIVED: "PLEDGE_ALREADY_RECEIVED",
  PLEDGE_EXPIRED: "PLEDGE_EXPIRED",
  PLEDGE_CANCELLED: "PLEDGE_CANCELLED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NEED_ITEM_REQUIRED: "NEED_ITEM_REQUIRED",
  QUANTITY_POSITIVE: "QUANTITY_POSITIVE",
  DONOR_NAME_TOO_LONG: "DONOR_NAME_TOO_LONG",
  DONOR_EMAIL_INVALID: "DONOR_EMAIL_INVALID",
  INTAKE_FAILED: "INTAKE_FAILED",
} as const;

export type IntakeErrorCodeKey =
  (typeof IntakeErrorCode)[keyof typeof IntakeErrorCode];

// ── Mensajes legibles en español (i18n ready) ─────────────────────────
export const INTAKE_MESSAGES: Record<string, string> = {
  [IntakeErrorCode.CODE_REQUIRED]: "Ingresá el código corto de la donación.",
  [IntakeErrorCode.CODE_INVALID_FORMAT]:
    "El código debe tener el formato SOS-XXXX (ej: SOS-87B2).",
  [IntakeErrorCode.PLEDGE_NOT_FOUND]:
    "No se encontró ninguna promesa con ese código para tu organización.",
  [IntakeErrorCode.PLEDGE_ALREADY_RECEIVED]:
    "Esta donación ya fue marcada como entregada/recibida anteriormente.",
  [IntakeErrorCode.PLEDGE_EXPIRED]:
    "La promesa de donación ha expirado, pero podés registrarla como donación directa.",
  [IntakeErrorCode.PLEDGE_CANCELLED]:
    "Esta promesa de donación fue cancelada previamente.",
  [IntakeErrorCode.UNAUTHORIZED]:
    "No tenés permisos en la organización correspondiente a esta donación.",
  [IntakeErrorCode.NEED_ITEM_REQUIRED]:
    "Seleccioná el ítem de necesidad recibido.",
  [IntakeErrorCode.QUANTITY_POSITIVE]:
    "La cantidad entregada debe ser mayor a 0.",
  [IntakeErrorCode.DONOR_NAME_TOO_LONG]:
    "El nombre del donante no puede superar los 255 caracteres.",
  [IntakeErrorCode.DONOR_EMAIL_INVALID]:
    "El correo electrónico ingresado no es válido.",
  [IntakeErrorCode.INTAKE_FAILED]:
    "Ocurrió un error al registrar la recepción. Por favor, intentá nuevamente.",
};

export function getIntakeErrorMessage(code: string): string {
  return INTAKE_MESSAGES[code] ?? code;
}

// ── Regex para formato SOS-XXXX ───────────────────────────────────────
export const SHORT_CODE_REGEX = /^SOS-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/u;

// ── Normalizador de código ────────────────────────────────────────────
export function normalizeShortCode(rawCode: string): string {
  const trimmed = rawCode.trim().toUpperCase();
  if (trimmed.startsWith("SOS-")) {
    return trimmed;
  }
  // Si el usuario ingresó solo los 4 caracteres
  if (/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/u.test(trimmed)) {
    return `SOS-${trimmed}`;
  }
  return trimmed;
}

// ── Esquema para Verificación por Código ──────────────────────────────
export const VerifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, IntakeErrorCode.CODE_REQUIRED)
    .transform(normalizeShortCode)
    .refine((val) => SHORT_CODE_REGEX.test(val), {
      message: IntakeErrorCode.CODE_INVALID_FORMAT,
    }),
});

export type VerifyCodeInput = z.infer<typeof VerifyCodeSchema>;

// ── Esquema para Confirmar Recepción de Promesa Existente ─────────────
export const ConfirmReceiptSchema = z.object({
  pledge_id: z.uuid(IntakeErrorCode.INTAKE_FAILED),
});

export type ConfirmReceiptInput = z.infer<typeof ConfirmReceiptSchema>;

// ── Esquema para Donación Directa en Puerta (Sin código previo) ───────
export const DirectDonationSchema = z.object({
  need_item_id: z.uuid(IntakeErrorCode.NEED_ITEM_REQUIRED),
  quantity: z.coerce.number().int().positive(IntakeErrorCode.QUANTITY_POSITIVE),
  donor_name: z
    .string()
    .max(255, IntakeErrorCode.DONOR_NAME_TOO_LONG)
    .optional()
    .transform((val) => (val?.trim() ? val.trim() : "Donante Anónimo")),
  donor_email: z
    .email(IntakeErrorCode.DONOR_EMAIL_INVALID)
    .optional()
    .or(z.literal("")),
  donor_phone: z.string().max(50).optional().or(z.literal("")),
});

export type DirectDonationInput = z.infer<typeof DirectDonationSchema>;
