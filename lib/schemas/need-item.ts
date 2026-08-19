import { z } from 'zod'

// ── Error codes — single source of truth ────────────────────────────
// Actions return these codes. Never return human-readable strings from the server.
// The frontend maps codes → display messages (see NeedItemForm.tsx).
export const NeedItemErrorCode = {
  // Validation
  CAMPAIGN_REQUIRED: 'CAMPAIGN_REQUIRED',
  CATEGORY_REQUIRED: 'CATEGORY_REQUIRED',
  CATEGORY_TOO_LONG: 'CATEGORY_TOO_LONG',
  ITEM_NAME_REQUIRED: 'ITEM_NAME_REQUIRED',
  ITEM_NAME_TOO_LONG: 'ITEM_NAME_TOO_LONG',
  QUANTITY_POSITIVE: 'QUANTITY_POSITIVE',
  UNIT_REQUIRED: 'UNIT_REQUIRED',
  UNIT_TOO_LONG: 'UNIT_TOO_LONG',
  URGENCY_INVALID: 'URGENCY_INVALID',
  COLLECTION_POINTS_REQUIRED: 'COLLECTION_POINTS_REQUIRED',
  // Server-side / _root errors
  CREATE_FAILED: 'CREATE_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  PIVOT_LINK_FAILED: 'PIVOT_LINK_FAILED'
} as const

export type NeedItemErrorCode =
  (typeof NeedItemErrorCode)[keyof typeof NeedItemErrorCode]

export const URGENCY_LEVELS = [
  'critical_4h',
  'urgent_12h',
  'standard_24h'
] as const
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]

export const NeedItemSchema = z.object({
  campaign_id: z.string().uuid(NeedItemErrorCode.CAMPAIGN_REQUIRED),
  category: z
    .string()
    .min(1, NeedItemErrorCode.CATEGORY_REQUIRED)
    .max(100, NeedItemErrorCode.CATEGORY_TOO_LONG),
  item_name: z
    .string()
    .min(1, NeedItemErrorCode.ITEM_NAME_REQUIRED)
    .max(255, NeedItemErrorCode.ITEM_NAME_TOO_LONG),
  target_quantity: z.coerce
    .number()
    .int()
    .positive(NeedItemErrorCode.QUANTITY_POSITIVE),
  unit: z
    .string()
    .min(1, NeedItemErrorCode.UNIT_REQUIRED)
    .max(50, NeedItemErrorCode.UNIT_TOO_LONG),
  urgency: z.enum(URGENCY_LEVELS, { error: NeedItemErrorCode.URGENCY_INVALID }),
  // Collection points — array of UUIDs; handled via formData.getAll() in the action
  collection_point_ids: z
    .array(z.string().uuid())
    .min(1, NeedItemErrorCode.COLLECTION_POINTS_REQUIRED)
})

export type NeedItemInput = z.infer<typeof NeedItemSchema>
