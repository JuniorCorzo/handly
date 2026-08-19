'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type CreateCampaignResult =
  | { success: true; campaign: { id: string; name: string } }
  | { success: false; error: string }

export async function createCampaign(
  formData: FormData
): Promise<CreateCampaignResult> {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  const name = String(formData.get('name') ?? '').trim()
  if (!name) {
    return { success: false, error: 'El nombre de la campaña es obligatorio' }
  }

  // Obtener la membresía del usuario como admin
  const { data: memberships, error: memErr } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('auth_user_id', user.id)

  if (memErr) {
    return { success: false, error: 'Error al verificar organización' }
  }

  const adminOrg =
    memberships?.find((m) => m.role === 'admin') ?? memberships?.[0]
  if (!adminOrg) {
    return {
      success: false,
      error: 'No pertenecés a ninguna organización o no tenés permisos'
    }
  }

  const { data: campaign, error: campErr } = await supabase
    .from('campaign')
    .insert({
      name,
      organization_id: adminOrg.org_id
    })
    .select('id, name')
    .single()

  if (campErr || !campaign) {
    return {
      success: false,
      error: campErr?.message ?? 'Error al crear la campaña'
    }
  }

  revalidatePath('/dashboard/needs/new')
  return { success: true, campaign }
}
