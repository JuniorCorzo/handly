"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NeedItemErrorCode, NeedItemSchema } from "@/lib/validations/need-item";
import { getUserOrganizations } from "@/src/lib/organizations";

export type { NeedItemActionState } from "./types";

// ── Auth guard ───────────────────────────────────────────────────────
async function requireUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// ── Admin role guard ────────────────────────────────────────────────
async function requireAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const user = await requireUser(supabase);
  const memberships = await getUserOrganizations(user.id, user.email);
  const isAdmin = memberships.some((m) => m.role === "admin");
  if (!isAdmin) {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return { user, memberships };
}

// ── CREATE ──────────────────────────────────────────────────────────
export async function createNeedItem(
  _prev: NeedItemActionState | null,
  formData: FormData
): Promise<NeedItemActionState> {
  const supabase = await createClient();

  try {
    await requireAdminUser(supabase);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "";
    if (errorMsg === "FORBIDDEN_ADMIN_ONLY") {
      return {
        success: false,
        errors: {
          _root: [
            "Solo los administradores pueden crear nuevos ítems de necesidad.",
          ],
        },
      };
    }
    throw error;
  }

  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  const rawData = {
    ...Object.fromEntries(formData),
    collection_point_ids: formData.getAll("collection_point_ids"),
  };

  const parsed = NeedItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  const {
    campaign_id,
    category,
    item_name,
    target_quantity,
    unit,
    urgency,
    collection_point_ids,
  } = parsed.data;

  // 1. Insert need_item
  const { data: ni, error: niErr } = await db
    .from("need_items")
    .insert({
      campaign_id,
      category,
      item_name,
      target_quantity,
      unit,
      urgency,
      status: "active",
    })
    .select("id")
    .single();

  if (niErr || !ni) {
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.CREATE_FAILED] },
    };
  }

  // 2. Link pivot table records
  const pivotRows = collection_point_ids.map((cpId) => ({
    need_item_id: ni.id,
    collection_point_id: cpId,
  }));

  const { error: pivotErr } = await db
    .from("need_items_collection_points")
    .insert(pivotRows);

  if (pivotErr) {
    await db.from("need_items").delete().eq("id", ni.id);
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.PIVOT_LINK_FAILED] },
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/needs");
  return { success: true, needItemId: ni.id };
}

// ── UPDATE ──────────────────────────────────────────────────────────
export async function updateNeedItem(
  needItemId: string,
  _prev: NeedItemActionState | null,
  formData: FormData
): Promise<NeedItemActionState> {
  const supabase = await createClient();

  try {
    await requireAdminUser(supabase);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "";
    if (errorMsg === "FORBIDDEN_ADMIN_ONLY") {
      return {
        success: false,
        errors: {
          _root: [
            "Solo los administradores pueden modificar ítems de necesidad.",
          ],
        },
      };
    }
    throw error;
  }

  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  const rawData = {
    ...Object.fromEntries(formData),
    collection_point_ids: formData.getAll("collection_point_ids"),
  };

  const parsed = NeedItemSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  const {
    campaign_id,
    category,
    item_name,
    target_quantity,
    unit,
    urgency,
    collection_point_ids,
  } = parsed.data;

  // 1. Update need_item fields
  const { error: updateErr } = await db
    .from("need_items")
    .update({
      campaign_id,
      category,
      item_name,
      target_quantity,
      unit,
      urgency,
    })
    .eq("id", needItemId);

  if (updateErr) {
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.UPDATE_FAILED] },
    };
  }

  // 2. Replace collection points in pivot table
  const { error: delErr } = await db
    .from("need_items_collection_points")
    .delete()
    .eq("need_item_id", needItemId);

  if (delErr) {
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.PIVOT_LINK_FAILED] },
    };
  }

  if (collection_point_ids.length > 0) {
    const pivotRows = collection_point_ids.map((cpId) => ({
      need_item_id: needItemId,
      collection_point_id: cpId,
    }));

    const { error: insErr } = await db
      .from("need_items_collection_points")
      .insert(pivotRows);

    if (insErr) {
      return {
        success: false,
        errors: { _root: [NeedItemErrorCode.PIVOT_LINK_FAILED] },
      };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/needs");
  revalidatePath(`/dashboard/needs/${needItemId}/edit`);
  return { success: true, needItemId };
}
