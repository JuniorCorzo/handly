import type {
  CampaignOption,
  CollectionPointOption,
  UrgencyLevel,
} from "../types";

export interface NeedItemAIContext {
  campaigns: CampaignOption[];
  collectionPoints: CollectionPointOption[];
  selectedCampaignId?: string;
}

export interface CreatedItemDetails {
  id: string;
  item_name: string;
  category: string;
  target_quantity: number;
  unit: string;
  urgency: UrgencyLevel;
  campaign_id: string;
  collection_point_ids: string[];
}

export interface ClarificationOption {
  id: string;
  label: string;
  description?: string;
}

export interface ClarificationRequest {
  question: string;
  contextKey: "campaign_id" | "urgency" | "category" | "general";
  options: ClarificationOption[];
  allowOther?: boolean;
}

export interface NeedItemAICreationResult {
  success: boolean;
  message: string;
  createdItems: CreatedItemDetails[];
  clarification?: ClarificationRequest;
  toolsExecuted?: {
    toolName: string;
    result: unknown;
  }[];
  error?: string;
}

export interface NemotronModelOptions {
  modelName?: string;
  baseURL?: string;
  temperature?: number;
  apiKey?: string;
}
