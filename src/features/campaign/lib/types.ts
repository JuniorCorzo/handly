import type { PublicNeedItem } from "@/components/NeedItemCard";

export interface PublicCampaign {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
    zoneCode: string;
    email: string | null;
    phone: string | null;
  } | null;
  needs: PublicNeedItem[];
}
