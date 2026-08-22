import { cache } from "react";

import type { PublicNeedItem } from "@/components/NeedItemCard";
import { createAdminClient, createClient } from "@/lib/supabase/server";

import type {
  CampaignOption,
  CollectionPointOption,
  NeedItemFormData,
  NeedItemTableRow,
  NeedStatus,
  UrgencyLevel,
} from "../types";

interface RawNeedItemDashboardRow {
  id: string;
  campaign_id: string;
  category: string;
  item_name: string;
  target_quantity: number;
  unit: string;
  urgency: string;
  status: string;
  created_at: string;
  campaign: {
    id: string;
    name: string;
    organization_id: string;
  } | null;
  need_items_collection_points:
    | {
        collection_points: {
          id: string;
          location_adress: string;
        } | null;
      }[]
    | null;
}

interface RawPublicNeedItemRow {
  id: string;
  category: string;
  item_name: string;
  target_quantity: number;
  unit: string;
  urgency: string;
  status: string;
  campaign: {
    id: string;
    name: string;
    organizations: { name: string } | null;
  } | null;
  need_items_collection_points:
    | {
        collection_points: {
          id: string;
          location_adress: string;
          open_time: string | null;
          close_time: string | null;
        } | null;
      }[]
    | null;
  pledges:
    | {
        quantity: number;
        status: string;
        expires_at: string;
      }[]
    | null;
}

/**
 * Obtiene los ítems de necesidad pertenecientes a las organizaciones indicadas,
 * formateados para la tabla del Dashboard.
 */
export async function getDashboardNeedItems(
  orgIds: string[]
): Promise<NeedItemTableRow[]> {
  if (!orgIds.length) {
    return [];
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  const { data: needItems, error } = await db
    .from("need_items")
    .select(
      `
      id,
      campaign_id,
      category,
      item_name,
      target_quantity,
      unit,
      urgency,
      status,
      created_at,
      campaign (
        id,
        name,
        organization_id
      ),
      need_items_collection_points (
        collection_points (
          id,
          location_adress
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error || !needItems) {
    if (error) {
      console.error("[Dashboard] Error fetching need items:", error);
    }
    return [];
  }

  const items = needItems as unknown as RawNeedItemDashboardRow[];
  const allowedOrgIds = new Set(orgIds);
  const result: NeedItemTableRow[] = [];

  for (const item of items) {
    if (item.campaign && !allowedOrgIds.has(item.campaign.organization_id)) {
      continue;
    }

    const points: { id: string; location_adress: string }[] = [];
    for (const p of item.need_items_collection_points ?? []) {
      const pid = p.collection_points?.id ?? "";
      if (pid) {
        points.push({
          id: pid,
          location_adress: p.collection_points?.location_adress ?? "",
        });
      }
    }

    result.push({
      id: item.id,
      campaign_id: item.campaign_id,
      campaign_name: item.campaign?.name ?? "",
      category: item.category,
      item_name: item.item_name,
      target_quantity: item.target_quantity,
      unit: item.unit,
      urgency: item.urgency as UrgencyLevel,
      status: item.status as NeedStatus,
      created_at: item.created_at,
      collection_points: points,
    });
  }

  return result;
}

/**
 * Obtiene un ítem de necesidad por ID con sus centros de acopio seleccionados.
 */
export async function getNeedItemById(id: string) {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  const { data: needItem, error } = await db
    .from("need_items")
    .select(
      `
      *,
      need_items_collection_points (
        collection_point_id
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !needItem) {
    return null;
  }

  const selectedPointIds =
    needItem.need_items_collection_points?.map(
      (p: { collection_point_id: string }) => p.collection_point_id
    ) ?? [];

  return {
    needItem,
    selectedPointIds,
  };
}

/**
 * Obtiene las opciones de campañas y centros de acopio para los formularios de Need Items.
 */
export async function getNeedItemFormData(
  orgIds: string[]
): Promise<NeedItemFormData> {
  if (!orgIds.length) {
    return { campaigns: [], collectionPoints: [] };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  const [campRes, cpRes] = await Promise.all([
    db.from("campaign").select("id, name").in("organization_id", orgIds),
    db
      .from("collection_points")
      .select("id, location_adress")
      .in("organization_id", orgIds),
  ]);

  if (campRes.error) {
    console.error("[NeedItem Form] Error fetching campaigns:", campRes.error);
  }
  if (cpRes.error) {
    console.error(
      "[NeedItem Form] Error fetching collection points:",
      cpRes.error
    );
  }

  const campaigns: CampaignOption[] = campRes.data ?? [];
  const collectionPoints: CollectionPointOption[] = cpRes.data ?? [];

  return { campaigns, collectionPoints };
}

/**
 * Obtiene los requerimientos de necesidad públicos activos con cálculo de progreso y compromisos.
 */
export const getPublicNeedItems = cache(async (): Promise<PublicNeedItem[]> => {
  const supabase = await createClient();

  const { data: needItems, error } = await supabase
    .from("need_items")
    .select(
      `
        id,
        category,
        item_name,
        target_quantity,
        unit,
        urgency,
        status,
        campaign:campaign_id (
          id,
          name,
          organizations:organization_id (
            name
          )
        ),
        need_items_collection_points (
          collection_points (
            id,
            location_adress,
            open_time,
            close_time
          )
        ),
        pledges (
          quantity,
          status,
          expires_at
        )
      `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !needItems) {
    if (error) {
      console.error("[PublicNeedsCatalog] Error fetching items:", error);
    }
    return [];
  }

  const now = new Date();
  const rows = needItems as unknown as RawPublicNeedItemRow[];

  return rows.map((item) => {
    const committed =
      item.pledges
        ?.filter(
          (p) =>
            p.status === "received" ||
            (p.status === "pending" && new Date(p.expires_at) > now)
        )
        .reduce((sum, p) => sum + (p.quantity || 0), 0) ?? 0;

    const remaining = Math.max(0, item.target_quantity - committed);
    const progress =
      item.target_quantity > 0
        ? Math.min(100, Math.round((committed / item.target_quantity) * 100))
        : 0;

    const collectionPoints =
      item.need_items_collection_points?.flatMap((p) => {
        if (!p.collection_points?.id) {
          return [];
        }
        return [
          {
            id: p.collection_points.id,
            location_adress: p.collection_points.location_adress,
            open_time: p.collection_points.open_time,
            close_time: p.collection_points.close_time,
          },
        ];
      }) ?? [];

    return {
      id: item.id,
      item_name: item.item_name,
      category: item.category,
      unit: item.unit,
      urgency: item.urgency as UrgencyLevel,
      target_quantity: item.target_quantity,
      committed_quantity: committed,
      remaining_quantity: remaining,
      progress_percentage: progress,
      is_fulfilled: remaining === 0,
      campaign_id: item.campaign?.id,
      campaign_name: item.campaign?.name,
      org_name: item.campaign?.organizations?.name,
      collection_points: collectionPoints,
    };
  });
});

/**
 * Obtiene la lista de categorías únicas registradas en need_items.
 */
export async function getDistinctCategories(): Promise<string[]> {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  const { data, error } = await db.from("need_items").select("category");

  if (error || !data) {
    return [];
  }

  const categorySet = new Set<string>();
  for (const row of data as { category: string | null }[]) {
    if (
      row.category &&
      typeof row.category === "string" &&
      row.category.trim()
    ) {
      categorySet.add(row.category.trim());
    }
  }

  return [...categorySet].sort();
}
