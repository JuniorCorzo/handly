import type { NeedItemInput } from "@/lib/validations/need-item";

export type UrgencyLevel = "critical_4h" | "urgent_12h" | "standard_24h";
export type NeedStatus = "active" | "fulfilled" | "cancelled";

export interface CollectionPointSummary {
  id: string;
  location_adress: string;
}

export interface NeedItemTableRow {
  id: string;
  campaign_id: string;
  campaign_name: string;
  category: string;
  item_name: string;
  target_quantity: number;
  unit: string;
  urgency: UrgencyLevel;
  status: NeedStatus;
  created_at: string;
  collection_points: CollectionPointSummary[];
}

export interface CampaignOption {
  id: string;
  name: string;
}

export interface CollectionPointOption {
  id: string;
  location_adress: string;
}

export interface NeedItemFormData {
  campaigns: CampaignOption[];
  collectionPoints: CollectionPointOption[];
}

export interface NeedItemFormValues {
  campaign_id?: string;
  category?: string;
  item_name?: string;
  target_quantity?: number;
  unit?: string;
  urgency?: string;
  collection_point_ids?: string[];
}

export type NeedItemActionState =
  | { success: true; needItemId: string }
  | {
      success: false;
      errors: Partial<Record<keyof NeedItemInput | "_root", string[]>>;
    };

export interface NeedItemRecord {
  id: string;
  campaign_id: string;
  category: string;
  item_name: string;
  target_quantity: number;
  unit: string;
  urgency: UrgencyLevel;
  status: NeedStatus;
  created_at: string;
  need_items_collection_points?: {
    collection_point_id: string;
    collection_points?: {
      id: string;
      location_adress: string;
      open_time?: string | null;
      close_time?: string | null;
    } | null;
  }[];
}
