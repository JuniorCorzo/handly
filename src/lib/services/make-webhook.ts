import { env } from "@/src/lib/env";
import { createClient } from "@/src/lib/supabase/server";

// ── Tipos de Payloads para Make Webhook ──────────────────────────────

export interface MakeCollectionPointData {
  name?: string;
  address: string;
  schedule?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DonorCommitmentPayload {
  event_type: "DONOR_COMMITMENT";
  recipient_email: string;
  data: {
    donor_name: string;
    org_name: string;
    campaign_name: string;
    item_name: string;
    quantity: string;
    commitment_code: string;
    expires_at: string;
    collection_points: MakeCollectionPointData[];
  };
}

export interface GoalAchievedItemPayload {
  event_type: "GOAL_ACHIEVED";
  recipient_email: string;
  data: {
    org_name: string;
    campaign_name: string;
    goal_type: "item";
    item_name: string;
    goal_reached: string | number;
    goal: string | number;
  };
}

export interface GoalAchievedCampaignPayload {
  event_type: "GOAL_ACHIEVED";
  recipient_email: string;
  data: {
    org_name: string;
    campaign_name: string;
    goal_type: "campaign";
    goal_reached: string | number;
    goal: string | number;
  };
}

export type MakeWebhookPayload =
  | DonorCommitmentPayload
  | GoalAchievedItemPayload
  | GoalAchievedCampaignPayload;

export interface MakeWebhookResponse {
  success: boolean;
  status?: number;
  error?: string;
}

// ── Cliente de Envío HTTP a Make Webhook ────────────────────────────

export async function sendMakeWebhook(
  payload: MakeWebhookPayload
): Promise<MakeWebhookResponse> {
  const { webhookUrl } = env.make;

  if (!webhookUrl) {
    console.warn(
      "[MakeWebhook] MAKE_WEBHOOK_URL is not configured. Webhook dispatch skipped."
    );
    return { success: false, error: "MAKE_WEBHOOK_URL not configured" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.make.apiKey) {
    headers["x-make-apikey"] = env.make.apiKey;
    headers["X-Make-Api-Key"] = env.make.apiKey;
    headers["Authorization"] = `Bearer ${env.make.apiKey}`;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let text = "";
      try {
        text = await response.text();
      } catch {
        text = "";
      }

      console.error(
        `[MakeWebhook] Error response ${response.status} from Make webhook:`,
        text
      );
      return {
        success: false,
        status: response.status,
        error: `Make returned status ${response.status}`,
      };
    }

    return { success: true, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[MakeWebhook] Failed to dispatch webhook to Make:", message);
    return { success: false, error: message };
  }
}

// ── Helper de Formateo de Fecha ─────────────────────────────────────

function formatExpiresAtDate(isoDateStr: string): string {
  try {
    const date = new Date(isoDateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes} Hs`;
  } catch {
    return isoDateStr;
  }
}

// ── Despacho Automático de Compromiso de Donación ────────────────────

export interface DispatchDonorCommitmentParams {
  needItemId: string;
  donorName: string;
  donorEmail: string;
  quantity: number;
  commitmentCode: string;
  expiresAt: string;
}

export async function dispatchDonorCommitmentNotification({
  needItemId,
  donorName,
  donorEmail,
  quantity,
  commitmentCode,
  expiresAt,
}: DispatchDonorCommitmentParams): Promise<MakeWebhookResponse> {
  const supabase = await createClient();

  // 1. Obtener detalles contextuales del ítem, campaña, organización y centros de acopio
  const { data: itemData, error } = await supabase
    .from("need_items")
    .select(
      `
      item_name,
      unit,
      campaign:campaign_id (
        name,
        organizations:organization_id (
          name
        )
      ),
      need_items_collection_points (
        collection_points (
          id,
          location_adress,
          latitude,
          longitude,
          open_time,
          close_time
        )
      )
    `
    )
    .eq("id", needItemId)
    .single();

  if (error || !itemData) {
    console.error(
      "[MakeWebhook] Failed to query need item details for webhook:",
      error
    );
    return { success: false, error: "Failed to retrieve item context" };
  }

  interface QueryResult {
    item_name: string;
    unit: string;
    campaign: {
      name: string;
      organizations: { name: string } | null;
    } | null;
    need_items_collection_points:
      | {
          collection_points: {
            id: string;
            location_adress: string;
            latitude: number | null;
            longitude: number | null;
            open_time: string | null;
            close_time: string | null;
          } | null;
        }[]
      | null;
  }

  const typedItem = itemData as unknown as QueryResult;

  const orgName =
    typedItem.campaign?.organizations?.name || "Organización Handly";
  const campaignName =
    typedItem.campaign?.name || "Campaña de Asistencia Comunitaria";
  const itemName = `${typedItem.item_name} (${typedItem.unit})`;

  // Construir centros de acopio
  const collectionPoints: MakeCollectionPointData[] =
    typedItem.need_items_collection_points?.flatMap((row) => {
      const cp = row.collection_points;
      if (!cp) {
        return [];
      }

      let schedule = "";
      if (cp.open_time && cp.close_time) {
        schedule = `${cp.open_time.slice(0, 5)} a ${cp.close_time.slice(0, 5)} hs`;
      }

      return [
        {
          name: "Punto de Recepción",
          address: cp.location_adress,
          schedule: schedule || undefined,
          latitude: cp.latitude,
          longitude: cp.longitude,
        },
      ];
    }) ?? [];

  const payload: DonorCommitmentPayload = {
    event_type: "DONOR_COMMITMENT",
    recipient_email: donorEmail,
    data: {
      donor_name: donorName,
      org_name: orgName,
      campaign_name: campaignName,
      item_name: itemName,
      quantity: String(quantity),
      commitment_code: commitmentCode,
      expires_at: formatExpiresAtDate(expiresAt),
      collection_points: collectionPoints,
    },
  };

  return sendMakeWebhook(payload);
}
