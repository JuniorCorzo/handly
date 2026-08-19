"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/src/lib/supabase/server";
import {
  NeedItemSchema,
  NeedItemErrorCode,
} from "@/src/lib/validations/need-item";
import type { NeedItemInput } from "@/src/lib/validations/need-item";

// ── Return type ─────────────────────────────────────────────────────
export type NeedItemActionState =
  | { success: true; needItemId: string }
  | {
      success: false;
      errors: Partial<Record<keyof NeedItemInput | "_root", string[]>>;
    };

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

// ── CREATE ──────────────────────────────────────────────────────────
export async function createNeedItem(
  _prev: NeedItemActionState | null,
  formData: FormData
): Promise<NeedItemActionState> {
  const supabase = await createClient();
  await requireUser(supabase);

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
  const { data: ni, error: niErr } = await supabase
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

  const { error: pivotErr } = await supabase
    .from("need_items_collection_points")
    .insert(pivotRows);

  if (pivotErr) {
    await supabase.from("need_items").delete().eq("id", ni.id);
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
  await requireUser(supabase);

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
  const { error: niErr } = await supabase
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

  if (niErr) {
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.UPDATE_FAILED] },
    };
  }

  // 2. Re-sync pivot records: delete existing links and insert selected ones
  const { error: delErr } = await supabase
    .from("need_items_collection_points")
    .delete()
    .eq("need_item_id", needItemId);

  if (delErr) {
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.PIVOT_LINK_FAILED] },
    };
  }

  const pivotRows = collection_point_ids.map((cpId) => ({
    need_item_id: needItemId,
    collection_point_id: cpId,
  }));

  const { error: insErr } = await supabase
    .from("need_items_collection_points")
    .insert(pivotRows);

  if (insErr) {
    return {
      success: false,
      errors: { _root: [NeedItemErrorCode.PIVOT_LINK_FAILED] },
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/needs");
  revalidatePath(`/dashboard/needs/${needItemId}/edit`);
  return { success: true, needItemId };
}
