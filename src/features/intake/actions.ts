"use server";

import crypto from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type {
  VerifiedPledgeDetails,
  IntakeReceipt,
} from "@/src/features/intake/types";
import { getUserOrganizations } from "@/src/lib/organizations";
import { createAdminClient, createClient } from "@/src/lib/supabase/server";
import {
  VerifyCodeSchema,
  ConfirmReceiptSchema,
  DirectDonationSchema,
  IntakeErrorCode,
  getIntakeErrorMessage,
} from "@/src/lib/validations/intake";

const DEFAULT_ANONYMOUS_DONOR = "Donante Anónimo";
const CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateSecureShortCode(): string {
  let code = "SOS-";
  const randomBytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i += 1) {
    const index = randomBytes[i] % CODE_CHARS.length;
    code += CODE_CHARS[index];
  }
  return code;
}

// ── Tipos de Retorno de Server Actions ───────────────────────────────

export type VerifyPledgeResult =
  | { success: true; pledge: VerifiedPledgeDetails }
  | { success: false; error: string; errorCode?: string };

export type ConfirmReceiptResult =
  | { success: true; receipt: IntakeReceipt }
  | { success: false; error: string; errorCode?: string };

export type DirectDonationResult =
  | { success: true; receipt: IntakeReceipt }
  | {
      success: false;
      error: string;
      errors?: Record<string, string[]>;
      errorCode?: string;
    };

// ── Auth Guard Helper ───────────────────────────────────────────────
async function requireAuthAndOrg() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[INTAKE_AUTH] No authenticated user found in session.");
    throw new Error("UNAUTHORIZED");
  }

  const memberships = await getUserOrganizations(user.id, user.email);
  const orgIds = memberships.map((m) => m.org_id);

  console.error(
    `[INTAKE_AUTH] User: ${user.email} (${user.id}) | Memberships count: ${memberships.length} | OrgIds: [${orgIds.join(", ")}]`
  );

  return { user, orgIds, supabase };
}

// ── 1. SA: Consultar Promesa por Código Corto (SOS-XXXX) ─────────────
export async function verifyPledgeByCode(
  rawCode: string
): Promise<VerifyPledgeResult> {
  try {
    const { orgIds, supabase } = await requireAuthAndOrg();

    const parsed = VerifyCodeSchema.safeParse({ code: rawCode });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      return {
        success: false,
        error: getIntakeErrorMessage(
          firstIssue || IntakeErrorCode.CODE_INVALID_FORMAT
        ),
        errorCode: firstIssue || IntakeErrorCode.CODE_INVALID_FORMAT,
      };
    }

    const normalizedCode = parsed.data.code;
    console.error(
      `[INTAKE:verifyPledgeByCode] Searching code: "${normalizedCode}"`
    );

    const adminClient = createAdminClient();
    const db = adminClient ?? supabase;

    // Buscar compromiso con datos de necesidad y campaña
    const { data: pledgeData, error: queryError } = await db
      .from("pledges")
      .select(
        `
        id,
        short_code,
        donor_name,
        donor_email,
        donor_phone,
        quantity,
        status,
        expires_at,
        created_at,
        need_item_id,
        need_items (
          id,
          item_name,
          category,
          unit,
          target_quantity,
          campaign (
            id,
            name,
            organization_id
          )
        )
      `
      )
      .eq("short_code", normalizedCode)
      .maybeSingle();

    if (queryError) {
      console.error(
        "[INTAKE:verifyPledgeByCode] Database error querying pledges:",
        queryError
      );
      return {
        success: false,
        error: `Error de base de datos al buscar código: ${queryError.message}`,
        errorCode: IntakeErrorCode.INTAKE_FAILED,
      };
    }

    if (!pledgeData) {
      console.error(
        `[INTAKE:verifyPledgeByCode] No pledge found with code "${normalizedCode}"`
      );
      return {
        success: false,
        error: getIntakeErrorMessage(IntakeErrorCode.PLEDGE_NOT_FOUND),
        errorCode: IntakeErrorCode.PLEDGE_NOT_FOUND,
      };
    }

    interface NeedItemQueryResult {
      id: string;
      item_name: string;
      category: string;
      unit: string;
      target_quantity: number;
      campaign:
        | {
            id: string;
            name: string;
            organization_id: string;
          }
        | {
            id: string;
            name: string;
            organization_id: string;
          }[]
        | null;
    }

    interface PledgeQueryResult {
      id: string;
      short_code: string;
      donor_name: string;
      donor_email: string;
      donor_phone?: string | null;
      quantity: number;
      status: "pending" | "received" | "cancelled";
      expires_at: string;
      created_at: string;
      need_items: NeedItemQueryResult | NeedItemQueryResult[] | null;
    }

    const p = pledgeData as unknown as PledgeQueryResult;
    const needItem = Array.isArray(p.need_items)
      ? p.need_items[0]
      : p.need_items;
    const campaign = Array.isArray(needItem?.campaign)
      ? needItem.campaign[0]
      : needItem?.campaign;

    if (!needItem || !campaign) {
      console.error(
        "[INTAKE:verifyPledgeByCode] NeedItem or Campaign relation missing on pledge:",
        p
      );
      return {
        success: false,
        error:
          "El compromiso encontrado no tiene una necesidad o campaña asociada válida.",
        errorCode: IntakeErrorCode.PLEDGE_NOT_FOUND,
      };
    }

    const pledgeOrgId = campaign.organization_id;
    console.error(
      `[INTAKE:verifyPledgeByCode] Found pledge ${p.id} for org ${pledgeOrgId}. User orgs: [${orgIds.join(", ")}]`
    );

    // Si el usuario tiene organizaciones vinculadas, validar pertenencia
    if (orgIds.length > 0 && !orgIds.includes(pledgeOrgId)) {
      console.error(
        `[INTAKE:verifyPledgeByCode] Org mismatch: pledge org ${pledgeOrgId} not in user orgs [${orgIds.join(", ")}]`
      );
      return {
        success: false,
        error: `No tenés permisos: Esta donación pertenece a la organización ${pledgeOrgId}, pero tu usuario pertenece a [${orgIds.join(", ")}].`,
        errorCode: IntakeErrorCode.UNAUTHORIZED,
      };
    }

    const now = new Date();
    const expiresAt = new Date(p.expires_at);
    const isExpired = p.status === "pending" && expiresAt < now;

    return {
      success: true,
      pledge: {
        id: p.id,
        short_code: p.short_code,
        donor_name: p.donor_name,
        donor_email: p.donor_email,
        donor_phone: p.donor_phone,
        quantity: p.quantity,
        status: p.status,
        expires_at: p.expires_at,
        is_expired: isExpired,
        created_at: p.created_at,
        need_item: {
          id: needItem.id,
          item_name: needItem.item_name,
          category: needItem.category,
          unit: needItem.unit,
          target_quantity: needItem.target_quantity,
        },
        campaign: {
          id: campaign.id,
          name: campaign.name,
          organization_id: pledgeOrgId,
        },
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "";
    if (errorMsg === "UNAUTHORIZED") {
      return {
        success: false,
        error: "Debés iniciar sesión para verificar donaciones.",
        errorCode: IntakeErrorCode.UNAUTHORIZED,
      };
    }
    console.error("[INTAKE:verifyPledgeByCode] Unexpected exception:", error);
    return {
      success: false,
      error: `Error inesperado: ${errorMsg || getIntakeErrorMessage(IntakeErrorCode.INTAKE_FAILED)}`,
      errorCode: IntakeErrorCode.INTAKE_FAILED,
    };
  }
}

// ── 2. SA: Confirmar Recepción Física (UPDATE pledges status = 'received') ─
export async function confirmPledgeReceipt(
  pledgeId: string
): Promise<ConfirmReceiptResult> {
  try {
    const { orgIds, supabase } = await requireAuthAndOrg();

    const parsed = ConfirmReceiptSchema.safeParse({ pledge_id: pledgeId });
    if (!parsed.success) {
      return {
        success: false,
        error: getIntakeErrorMessage(IntakeErrorCode.INTAKE_FAILED),
      };
    }

    console.error(
      `[INTAKE:confirmPledgeReceipt] Confirming pledgeId: "${pledgeId}"`
    );
    const adminClient = createAdminClient();
    const db = adminClient ?? supabase;

    // 1. Verificar existencia y pertenencia
    const { data: existingPledge, error: fetchErr } = await db
      .from("pledges")
      .select(
        `
        id,
        short_code,
        donor_name,
        donor_email,
        quantity,
        status,
        need_items (
          id,
          item_name,
          unit,
          campaign (
            organization_id
          )
        )
      `
      )
      .eq("id", pledgeId)
      .maybeSingle();

    if (fetchErr || !existingPledge) {
      console.error(
        "[INTAKE:confirmPledgeReceipt] Error finding pledge to confirm:",
        fetchErr
      );
      return {
        success: false,
        error: getIntakeErrorMessage(IntakeErrorCode.PLEDGE_NOT_FOUND),
      };
    }

    interface ExistingNeedItemResult {
      id: string;
      item_name: string;
      unit: string;
      campaign:
        | {
            organization_id: string;
          }
        | {
            organization_id: string;
          }[]
        | null;
    }

    interface ExistingPledgeQueryResult {
      id: string;
      short_code: string;
      donor_name: string;
      donor_email: string;
      quantity: number;
      status: string;
      need_items: ExistingNeedItemResult | ExistingNeedItemResult[] | null;
    }

    const p = existingPledge as unknown as ExistingPledgeQueryResult;
    const needItem = Array.isArray(p.need_items)
      ? p.need_items[0]
      : p.need_items;
    const campaign = Array.isArray(needItem?.campaign)
      ? needItem.campaign[0]
      : needItem?.campaign;
    const pledgeOrgId = campaign?.organization_id;

    if (pledgeOrgId && orgIds.length > 0 && !orgIds.includes(pledgeOrgId)) {
      console.error(
        `[INTAKE:confirmPledgeReceipt] Permission denied: pledge org ${pledgeOrgId} not in user orgs [${orgIds.join(", ")}]`
      );
      return {
        success: false,
        error: getIntakeErrorMessage(IntakeErrorCode.UNAUTHORIZED),
      };
    }

    if (p.status === "received") {
      return {
        success: false,
        error: getIntakeErrorMessage(IntakeErrorCode.PLEDGE_ALREADY_RECEIVED),
        errorCode: IntakeErrorCode.PLEDGE_ALREADY_RECEIVED,
      };
    }

    // 2. Ejecutar actualización atómica vía RPC o UPDATE
    const { error: rpcErr } = await db.rpc("receive_pledge_tx", {
      p_pledge_id: pledgeId,
    });

    if (rpcErr) {
      console.error(
        "[INTAKE:confirmPledgeReceipt] RPC receive_pledge_tx failed:",
        rpcErr
      );
      const { error: updateErr } = await db
        .from("pledges")
        .update({ status: "received" })
        .eq("id", pledgeId);

      if (updateErr) {
        console.error(
          "[INTAKE:confirmPledgeReceipt] Direct update also failed:",
          updateErr
        );
        return {
          success: false,
          error: `Error al actualizar estado en base de datos: ${updateErr.message}`,
        };
      }
    }

    // 3. Revalidación de rutas para actualizar inventario y métricas en vivo
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/intake");
    revalidatePath("/");

    return {
      success: true,
      receipt: {
        id: p.id,
        short_code: p.short_code,
        need_item_name: needItem?.item_name || "Ítem de donación",
        unit: needItem?.unit || "unidades",
        quantity: p.quantity,
        donor_name: p.donor_name,
        donor_email: p.donor_email,
        received_at: new Date().toISOString(),
        is_direct: false,
      },
    };
  } catch (error) {
    console.error("[INTAKE:confirmPledgeReceipt] Exception:", error);
    return {
      success: false,
      error: getIntakeErrorMessage(IntakeErrorCode.INTAKE_FAILED),
    };
  }
}

// ── 3. SA: Registrar Donación Directa en Puerta (Sin código previo) ───
export async function recordDirectDonation(
  formData: FormData
): Promise<DirectDonationResult> {
  try {
    const { orgIds, supabase } = await requireAuthAndOrg();

    const rawData = Object.fromEntries(formData);
    const parsed = DirectDonationSchema.safeParse(rawData);

    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      const firstErrorMessage =
        parsed.error.issues[0]?.message || IntakeErrorCode.INTAKE_FAILED;
      return {
        success: false,
        error: getIntakeErrorMessage(firstErrorMessage),
        errors: fieldErrors,
      };
    }

    const { need_item_id, quantity, donor_name, donor_email, donor_phone } =
      parsed.data;
    console.error(
      `[INTAKE:recordDirectDonation] Registering direct donation for need_item_id: "${need_item_id}", quantity: ${quantity}`
    );

    const adminClient = createAdminClient();
    const db = adminClient ?? supabase;

    // Verificar que el need_item pertenezca a la organización
    const { data: needItemData, error: needErr } = await db
      .from("need_items")
      .select(
        `
        id,
        item_name,
        unit,
        campaign (
          organization_id
        )
      `
      )
      .eq("id", need_item_id)
      .maybeSingle();

    if (needErr || !needItemData) {
      console.error(
        "[INTAKE:recordDirectDonation] Need item not found or DB error:",
        needErr
      );
      return {
        success: false,
        error: `No se encontró el ítem de necesidad (${needErr?.message || "ID inválido"})`,
      };
    }

    interface NeedItemCampaign {
      id: string;
      item_name: string;
      unit: string;
      campaign:
        | {
            organization_id: string;
          }
        | {
            organization_id: string;
          }[]
        | null;
    }

    const item = needItemData as unknown as NeedItemCampaign;
    const campaign = Array.isArray(item.campaign)
      ? item.campaign[0]
      : item.campaign;
    const itemOrgId = campaign?.organization_id;

    if (itemOrgId && orgIds.length > 0 && !orgIds.includes(itemOrgId)) {
      console.error(
        `[INTAKE:recordDirectDonation] Org mismatch: item org ${itemOrgId} not in user orgs [${orgIds.join(", ")}]`
      );
      return {
        success: false,
        error: `No tenés permisos sobre la organización (${itemOrgId}) de este ítem.`,
      };
    }

    const finalDonorName = donor_name || DEFAULT_ANONYMOUS_DONOR;

    // 1. Registrar vía RPC transaccional unificado (create_pledge_tx)
    const { data: rpcData, error: rpcErr } = await db.rpc("create_pledge_tx", {
      p_need_item_id: need_item_id,
      p_quantity: quantity,
      p_donor_name: finalDonorName,
      p_donor_email: donor_email || "direct-intake@acopio.local",
      p_status: "received",
      p_donor_phone: donor_phone || null,
    });

    let createdPledgeId = "";
    let shortCode = "";

    if (rpcErr || !rpcData) {
      console.error(
        "[INTAKE:recordDirectDonation] RPC create_pledge_tx failed:",
        rpcErr
      );
      const generatedCode = generateSecureShortCode();

      const { data: insertedPledge, error: insertErr } = await db
        .from("pledges")
        .insert({
          need_item_id,
          short_code: generatedCode,
          donor_name: finalDonorName,
          donor_email: donor_email || "direct-intake@acopio.local",
          donor_phone: donor_phone || null,
          quantity,
          status: "received",
          expires_at: new Date().toISOString(),
        })
        .select("id, short_code")
        .single();

      if (insertErr || !insertedPledge) {
        console.error(
          "[INTAKE:recordDirectDonation] Direct insert also failed:",
          insertErr
        );
        return {
          success: false,
          error: `Error al insertar donación: ${insertErr?.message || rpcErr?.message || getIntakeErrorMessage(IntakeErrorCode.INTAKE_FAILED)}`,
        };
      }

      createdPledgeId = insertedPledge.id;
      shortCode = insertedPledge.short_code;
    } else {
      const res = rpcData as { id: string; short_code: string };
      createdPledgeId = res.id;
      shortCode = res.short_code;
    }

    // Revalidar rutas para actualizar el contador remanente en tiempo real
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/intake");
    revalidatePath("/");

    return {
      success: true,
      receipt: {
        id: createdPledgeId,
        short_code: shortCode,
        need_item_name: item.item_name,
        unit: item.unit,
        quantity,
        donor_name: finalDonorName,
        donor_email: donor_email || null,
        received_at: new Date().toISOString(),
        is_direct: true,
      },
    };
  } catch (error) {
    console.error("[INTAKE:recordDirectDonation] Unexpected exception:", error);
    return {
      success: false,
      error: getIntakeErrorMessage(IntakeErrorCode.INTAKE_FAILED),
    };
  }
}
