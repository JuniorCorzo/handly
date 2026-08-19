import type { UrgencyLevel } from '@/lib/validations/need-item'

export interface PublicCollectionPoint {
  id: string
  address: string
  opensAt: string
  closesAt: string
}

export interface PublicNeedItem {
  id: string
  category: string
  itemName: string
  targetQuantity: number
  unit: string
  urgency: UrgencyLevel
  status: 'active' | 'fulfilled' | 'cancelled'
  collectionPoints: PublicCollectionPoint[]
}

export interface PublicCampaign {
  id: string
  name: string
  organization: {
    id: string
    name: string
    zoneCode: string
    email: string | null
    phone: string | null
  } | null
  needs: PublicNeedItem[]
}
