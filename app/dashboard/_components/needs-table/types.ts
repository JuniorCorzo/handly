export type UrgencyLevel = 'critical_4h' | 'urgent_12h' | 'standard_24h'
export type NeedStatus = 'active' | 'fulfilled' | 'cancelled'

export interface CollectionPointSummary {
  id: string
  location_adress: string
}

export interface NeedItemTableRow {
  id: string
  campaign_id: string
  campaign_name: string
  category: string
  item_name: string
  target_quantity: number
  unit: string
  urgency: UrgencyLevel
  status: NeedStatus
  created_at: string
  collection_points: CollectionPointSummary[]
}
