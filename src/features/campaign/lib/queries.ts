import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  PublicCampaign,
  PublicCollectionPoint,
  PublicNeedItem
} from './types'
import { sortByUrgency } from './urgency'

/**
 * Shape de las filas devueltas por Supabase (join anidado con el pivote
 * need_items_collection_points → collection_points). Se castea con `as unknown as`
 * — mismo patrón que app/dashboard/page.tsx.
 */
interface PublicNeedItemQueryRow {
  id: string
  category: string
  item_name: string
  target_quantity: number
  unit: string
  urgency: string
  status: string
  need_items_collection_points:
    | {
        collection_points: {
          id: string
          location_adress: string | null
          open_time: string | null
          close_time: string | null
        } | null
      }[]
    | null
}

interface PublicCampaignQueryRow {
  id: string
  name: string
  organization_id: string
  organizations:
    | {
        id: string
        name: string
        zone_code: string | null
        email: string | null
        phone: string | null
      }
    | {
        id: string
        name: string
        zone_code: string | null
        email: string | null
        phone: string | null
      }[]
    | null
}

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

/**
 * Carga la campaña pública con sus necesidades activas y puntos de acopio.
 * Envuelta en `cache()` de React para deduplicar entre generateMetadata y el
 * render de la página.
 *
 * Por decisión del producto, la dirección exacta del punto de acopio es pública
 * (el donante invitado la necesita para elegir el punto más cercano), al igual
 * que los medios de contacto de la organización (email, teléfono). Se mantienen
 * privados los datos operativos internos (lat/lng; no hay mapa en el MVP).
 */
export const getPublicCampaign = cache(
  async (campaignId: string): Promise<PublicCampaign | null> => {
    if (!UUID_RE.test(campaignId)) return null

    const supabase = await createClient()

    // ── 1. Campaña + organización (incluye medios de contacto) ──────────────
    const { data: campaignRow } = await supabase
      .from('campaign')
      .select(
        `
        id,
        name,
        organization_id,
        organizations (
          id,
          name,
          zone_code,
          email,
          phone
        )
        `
      )
      .eq('id', campaignId)
      .maybeSingle()

    if (!campaignRow) return null

    const campaign = campaignRow as unknown as PublicCampaignQueryRow

    // Normalización de la relación organizaciones: Supabase puede devolver
    // objeto o array según la unicidad de la FK. Mismo patrón que
    // app/dashboard/page.tsx.
    const org = campaign.organizations as unknown
    const orgRow = Array.isArray(org)
      ? org[0]
      : (org as {
          id: string
          name: string
          zone_code: string | null
          email: string | null
          phone: string | null
        } | null)

    // ── 2. Necesidades activas + puntos de acopio ──────────────────────
    const { data: needRows, error } = await supabase
      .from('need_items')
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
        )
        `
      )
      .eq('campaign_id', campaignId)
      .eq('status', 'active')

    let needs: PublicNeedItem[] = []
    if (error) {
      // No fatal: se muestra la campaña sin necesidades y se loguea.
      console.error('[Campaign] Error fetching need items:', error)
    } else if (needRows) {
      const rows = needRows as unknown as PublicNeedItemQueryRow[]

      needs = rows
        .map((row) => {
          // Flatten: need_items_collection_points → collection_points.
          const pointsById = new Map<string, PublicCollectionPoint>()
          for (const link of row.need_items_collection_points ?? []) {
            const cp = link.collection_points
            if (!cp) continue
            const address =
              cp.location_adress?.trim() || 'Dirección a confirmar'
            pointsById.set(cp.id, {
              id: cp.id,
              address,
              opensAt: cp.open_time ?? '',
              closesAt: cp.close_time ?? ''
            })
          }
          const points = [...pointsById.values()]

          const urgency = row.urgency as PublicNeedItem['urgency']

          return {
            id: row.id,
            category: row.category,
            itemName: row.item_name,
            targetQuantity: row.target_quantity,
            unit: row.unit,
            urgency,
            status: row.status as PublicNeedItem['status'],
            collectionPoints: points
          }
        })
        .filter(
          (need): need is PublicNeedItem =>
            need.urgency === 'critical_4h' ||
            need.urgency === 'urgent_12h' ||
            need.urgency === 'standard_24h'
        )
    }

    // ── 3. Normalización final ─────────────────────────────────────────
    const result: PublicCampaign = {
      id: campaign.id,
      name: campaign.name,
      organization: orgRow
        ? {
            id: orgRow.id,
            name: orgRow.name,
            zoneCode: orgRow.zone_code ?? '',
            email: orgRow.email ?? null,
            phone: orgRow.phone ?? null
          }
        : null,
      needs: sortByUrgency(needs)
    }

    return result
  }
)
