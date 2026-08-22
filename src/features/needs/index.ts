// Actions
export { createNeedItem, updateNeedItem } from "./actions";
export { createNeedItemWithAI } from "./ai/actions";

// AI Submodule
export { createNemotronModel } from "./ai/provider";
export { buildNeedItemSystemPrompt } from "./ai/prompts";
export { createNeedItemAITools } from "./ai/tools";
export type {
  NeedItemAIContext,
  NeedItemAICreationResult,
  CreatedItemDetails,
  NemotronModelOptions,
} from "./ai/types";

// Queries
export {
  getDashboardNeedItems,
  getNeedItemById,
  getNeedItemFormData,
  getPublicNeedItems,
  getDistinctCategories,
} from "./lib/queries";

// Constants & helpers
export {
  NEED_ITEM_MESSAGES,
  getNeedItemErrorMessage,
  URGENCY_LABELS,
  URGENCY_MAP,
  STATUS_MAP,
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
} from "./lib/constants";

// Types
export type {
  UrgencyLevel,
  NeedStatus,
  CollectionPointSummary,
  NeedItemTableRow,
  CampaignOption,
  CollectionPointOption,
  NeedItemFormData,
  NeedItemFormValues,
  NeedItemActionState,
  NeedItemRecord,
} from "./types";

// Hooks
export { useNeedsFilters } from "./hooks/useNeedsFilters";

// Components
export { NeedItemForm } from "./components/NeedItemForm";
export { NeedItemsTable } from "./components/NeedItemsTable";
export { NeedItemsTableToolbar } from "./components/NeedItemsTableToolbar";
export { PublicNeedsCatalog } from "./components/PublicNeedsCatalog";
export { NeedItemAIAssistant } from "./components/ai/NeedItemAIAssistant";
export { NewNeedItemTabs } from "./components/NewNeedItemTabs";
export { getColumns, columns } from "./components/columns";
