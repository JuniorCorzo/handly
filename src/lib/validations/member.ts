import { z } from "zod";

// ── Tipo de Rol de Organización (enum: admin | operator) ─────────────
export const ORG_MEMBER_ROLES = ["admin", "operator"] as const;
export type OrgMemberRole = (typeof ORG_MEMBER_ROLES)[number];

// ── Códigos de Error ────────────────────────────────────────────────
export const MemberErrorCode = {
  EMAIL_REQUIRED: "EMAIL_REQUIRED",
  EMAIL_INVALID: "EMAIL_INVALID",
  ROLE_INVALID: "ROLE_INVALID",
  ORG_ID_REQUIRED: "ORG_ID_REQUIRED",
  ORG_NAME_REQUIRED: "ORG_NAME_REQUIRED",
  ORG_PHONE_REQUIRED: "ORG_PHONE_REQUIRED",
  FULL_NAME_REQUIRED: "FULL_NAME_REQUIRED",
  FULL_NAME_TOO_LONG: "FULL_NAME_TOO_LONG",
  PHONE_REQUIRED: "PHONE_REQUIRED",
  UNAUTHORIZED: "UNAUTHORIZED",
  ALREADY_MEMBER: "ALREADY_MEMBER",
  INVITATION_EXISTS: "INVITATION_EXISTS",
  INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
  INVITATION_EXPIRED: "INVITATION_EXPIRED",
} as const;

export type MemberErrorCodeKey =
  (typeof MemberErrorCode)[keyof typeof MemberErrorCode];

export const MEMBER_MESSAGES: Record<string, string> = {
  [MemberErrorCode.EMAIL_REQUIRED]: "El correo electrónico es obligatorio.",
  [MemberErrorCode.EMAIL_INVALID]: "Ingresá un correo electrónico válido.",
  [MemberErrorCode.ROLE_INVALID]: "El rol seleccionado no es válido.",
  [MemberErrorCode.ORG_ID_REQUIRED]: "La organización es obligatoria.",
  [MemberErrorCode.ORG_NAME_REQUIRED]:
    "El nombre de la organización es obligatorio.",
  [MemberErrorCode.ORG_PHONE_REQUIRED]:
    "El teléfono institucional de la organización es obligatorio.",
  [MemberErrorCode.FULL_NAME_REQUIRED]: "Tu nombre completo es obligatorio.",
  [MemberErrorCode.FULL_NAME_TOO_LONG]:
    "El nombre no puede exceder los 255 caracteres.",
  [MemberErrorCode.PHONE_REQUIRED]: "El teléfono de contacto es obligatorio.",
  [MemberErrorCode.UNAUTHORIZED]:
    "No tenés permisos para realizar esta acción.",
  [MemberErrorCode.ALREADY_MEMBER]:
    "Este usuario ya es miembro de la organización.",
  [MemberErrorCode.INVITATION_EXISTS]:
    "Ya existe una invitación pendiente para este correo.",
  [MemberErrorCode.INVITATION_NOT_FOUND]: "La invitación no fue encontrada.",
  [MemberErrorCode.INVITATION_EXPIRED]: "La invitación ha expirado.",
};

export function getMemberErrorMessage(code: string): string {
  return MEMBER_MESSAGES[code] ?? code;
}

// ── Esquemas Zod ─────────────────────────────────────────────────────
export const InviteMemberSchema = z.object({
  org_id: z.uuid(MemberErrorCode.ORG_ID_REQUIRED),
  email: z.email(MemberErrorCode.EMAIL_INVALID),
  role: z.enum(ORG_MEMBER_ROLES, {
    message: MemberErrorCode.ROLE_INVALID,
  }),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const OnboardingSchema = z.object({
  full_name: z
    .string()
    .min(1, MemberErrorCode.FULL_NAME_REQUIRED)
    .max(255, MemberErrorCode.FULL_NAME_TOO_LONG),
  phone: z.string().min(1, MemberErrorCode.PHONE_REQUIRED).max(50),
  job_title: z.string().max(100).optional().default(""),
  // Campos de organización (requeridos únicamente si no se une por invitación)
  organization_name: z.string().max(255).optional().default(""),
  organization_phone: z.string().max(50).optional().default(""),
  zone_code: z.string().max(50).optional().default(""),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
