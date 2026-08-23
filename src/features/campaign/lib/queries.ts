import { cache } from "react";

import type {
  PublicCollectionPoint,
  PublicNeedItem,
} from "@/components/NeedItemCard";
import { createClient } from "@/lib/supabase/server";

import type { PublicCampaign } from "./types";
import { sortByUrgency } from "./urgency";

/**
 * Shape de las filas devueltas por Supabase (join anidado con el pivote
 * need_items_collection_points → collection_points). Se castea con `as unknown as`
 * — mismo patrón que app/dashboard/page.tsx.
 */
interface PublicNeedItemQueryRow {
  id: string;
  category: string;
  item_name: string;
  target_quantity: number;
  unit: string;
  urgency: string;
  status: string;
  need_items_collection_points:
    | {
        collection_points: {
          id: string;
          location_adress: string | null;
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

interface PublicCampaignQueryRow {
  id: string;
  name: string;
  organization_id: string;
  organizations:
    | {
        id: string;
        name: string;
        zone_code: string | null;
        phone: string | null;
      }
    | {
        id: string;
        name: string;
        zone_code: string | null;
        phone: string | null;
      }[]
    | null;
}

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/u;

/**
 * Carga la campaña pública con sus necesidades activas y puntos de acopio.
 * Envuelta en `cache()` de React para deduplicar entre generateMetadata y el
 * render de la página.
 */
export const getPublicCampaign = cache(
  async (campaignId: string): Promise<PublicCampaign | null> => {
    if (!UUID_RE.test(campaignId)) {
      return null;
    }

    const supabase = await createClient();

    // ── 1. Campaña + organización ──────────────────────────────────────
    const { data: campaignRow } = await supabase
      .from("campaign")
      .select(
        `
        id,
        name,
        organization_id,
        organizations (
          id,
          name,
          zone_code,
          phone
        )
        `
      )
      .eq("id", campaignId)
      .maybeSingle();

    if (!campaignRow) {
      return null;
    }

    const campaign = campaignRow as unknown as PublicCampaignQueryRow;

    // Normalización de la relación organizaciones: Supabase puede devolver
    // objeto o array según la unicidad de la FK. Mismo patrón que
    // app/dashboard/page.tsx.
    const org = campaign.organizations as unknown;
    const orgRow = Array.isArray(org)
      ? org[0]
      : (org as {
          id: string;
          name: string;
          zone_code: string | null;
          phone: string | null;
        } | null);

    // ── 2. Necesidades activas + puntos de acopio ──────────────────────
    const { data: needRows, error } = await supabase
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
      .eq("campaign_id", campaignId)
      .eq("status", "active");

    let needs: PublicNeedItem[] = [];
    if (error) {
      // No fatal: se muestra la campaña sin necesidades y se loguea.
      console.error("[Campaign] Error fetching need items:", error);
    } else if (needRows) {
      const now = new Date();
      const rows = needRows as unknown as PublicNeedItemQueryRow[];

      const needsList: PublicNeedItem[] = [];
      for (const row of rows) {
        // Flatten: need_items_collection_points → collection_points.
        const pointsById = new Map<string, PublicCollectionPoint>();
        for (const link of row.need_items_collection_points ?? []) {
          const cp = link.collection_points;
          if (!cp) {
            continue;
          }
          const address = cp.location_adress?.trim() || "Dirección a confirmar";
          pointsById.set(cp.id, {
            id: cp.id,
            location_adress: address,
            open_time: cp.open_time ?? null,
            close_time: cp.close_time ?? null,
          });
        }
        const collectionPoints = [...pointsById.values()];

        // Cantidad comprometida activa (recibidos o pendientes no vencidos).
        let committed = 0;
        for (const p of row.pledges ?? []) {
          if (
            p.status === "received" ||
            (p.status === "pending" && new Date(p.expires_at) > now)
          ) {
            committed += p.quantity || 0;
          }
        }

        const remaining = Math.max(0, row.target_quantity - committed);
        const progress =
          row.target_quantity > 0
            ? Math.min(100, Math.round((committed / row.target_quantity) * 100))
            : 0;

        const urgency = row.urgency as PublicNeedItem["urgency"];

        const need: PublicNeedItem = {
          id: row.id,
          item_name: row.item_name,
          category: row.category,
          unit: row.unit,
          urgency,
          target_quantity: row.target_quantity,
          committed_quantity: committed,
          remaining_quantity: remaining,
          progress_percentage: progress,
          is_fulfilled: remaining === 0,
          org_name: orgRow?.name,
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          collection_points: collectionPoints,
        };

        if (
          need.urgency === "critical_4h" ||
          need.urgency === "urgent_12h" ||
          need.urgency === "standard_24h"
        ) {
          needsList.push(need);
        }
      }
      needs = needsList;
    }

    // ── 3. Normalización final ─────────────────────────────────────────
    const result: PublicCampaign = {
      id: campaign.id,
      name: campaign.name,
      organization: orgRow
        ? {
            id: orgRow.id,
            name: orgRow.name,
            zoneCode: orgRow.zone_code ?? "",
            phone: orgRow.phone ?? null,
          }
        : null,
      needs: sortByUrgency(needs),
    };

    return result;
  }
);
