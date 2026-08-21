export interface VerifiedPledgeDetails {
  id: string;
  short_code: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string | null;
  quantity: number;
  status: "pending" | "received" | "cancelled";
  expires_at: string;
  is_expired: boolean;
  created_at: string;
  need_item: {
    id: string;
    item_name: string;
    category: string;
    unit: string;
    target_quantity: number;
  };
  campaign: {
    id: string;
    name: string;
    organization_id: string;
  };
}

export interface IntakeReceipt {
  id: string;
  short_code: string;
  need_item_name: string;
  unit: string;
  quantity: number;
  donor_name: string;
  donor_email?: string | null;
  received_at: string;
  is_direct: boolean;
}

export interface ActiveNeedOption {
  id: string;
  item_name: string;
  category: string;
  unit: string;
  target_quantity: number;
  campaign_name: string;
  campaign_id: string;
}

export type IntakeMode = "code" | "direct";
