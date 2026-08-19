"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { dispatchDonorCommitmentNotification } from "@/src/lib/services/make-webhook";
import { createClient } from "@/src/lib/supabase/server";
import { PledgeSchema, PledgeErrorCode } from "@/src/lib/validations/pledge";
import type { PledgeInput, PledgeResult } from "@/src/lib/validations/pledge";

export type PledgeActionState =
  | { success: true; pledge: PledgeResult }
  | {
      success: false;
      errors: Partial<Record<keyof PledgeInput | "_root", string[]>>;
    };

export async function createPledge(
  _prev: PledgeActionState | null,
  formData: FormData
): Promise<PledgeActionState> {
  const supabase = await createClient();

  // 1. Validación de entradas con Zod
  const parsed = PledgeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { need_item_id, donor_name, donor_email, quantity } = parsed.data;

  // 2. Ejecutar la función transaccional en Postgres con email
  const { data, error } = await supabase.rpc("create_pledge_tx", {
    p_need_item_id: need_item_id,
    p_donor_name: donor_name,
    p_donor_email: donor_email,
    p_quantity: quantity,
  });

  // 3. Mapeo de excepciones de negocio y base de datos
  if (error) {
    const errorMsg = error.message || "";

    if (errorMsg.includes("ITEM_NOT_AVAILABLE")) {
      return {
        success: false,
        errors: { _root: [PledgeErrorCode.ITEM_NOT_AVAILABLE] },
      };
    }

    if (errorMsg.includes("INSUFFICIENT_QUOTA_AVAILABLE")) {
      return {
        success: false,
        errors: { quantity: [PledgeErrorCode.INSUFFICIENT_QUOTA_AVAILABLE] },
      };
    }

    return {
      success: false,
      errors: { _root: [PledgeErrorCode.PLEDGE_CREATION_FAILED] },
    };
  }

  const resultPledge = data as PledgeResult;

  // 4. Despacho no bloqueante de notificación por correo vía Webhook de Make
  try {
    await dispatchDonorCommitmentNotification({
      needItemId: need_item_id,
      donorName: donor_name,
      donorEmail: donor_email,
      quantity,
      commitmentCode: resultPledge.short_code,
      expiresAt: resultPledge.expires_at,
    });
  } catch (notifyError) {
    console.error("[createPledge] Background notification error:", notifyError);
  }

  // 5. Revalidación de rutas
  revalidatePath("/");
  revalidatePath("/dashboard");

  return {
    success: true,
    pledge: resultPledge,
  };
}
