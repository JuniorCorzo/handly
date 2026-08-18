import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NeedItemsTable } from './_components/needs-table/NeedItemsTable'
import type {
  NeedItemTableRow,
  UrgencyLevel,
  NeedStatus
} from './_components/needs-table/types'

export const instant = false

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Obtener membresías de la organización
  const { data: memberships } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name)')
    .eq('auth_user_id', user.id)

  const orgIds = memberships?.map((m) => m.org_id) ?? []
  const firstOrg = memberships?.[0]?.organizations as unknown
  const orgName =
    (Array.isArray(firstOrg)
      ? (firstOrg[0] as { name?: string })?.name
      : (firstOrg as { name?: string } | null)?.name) ?? 'Mi Organización'

  // 2. Obtener ítems de necesidad con su campaña y centros de acopio
  let needItemRows: NeedItemTableRow[] = []

  if (orgIds.length > 0) {
    const { data: needItems, error } = await supabase
      .from('need_items')
      .select(
        `
        id,
        campaign_id,
        category,
        item_name,
        target_quantity,
        unit,
        urgency,
        status,
        created_at,
        campaign (
          id,
          name,
          organization_id
        ),
        need_items_collection_points (
          collection_points (
            id,
            location_adress
          )
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Dashboard] Error fetching need items:', error)
    } else if (needItems) {
      // Filtrar únicamente los ítems que correspondan a las organizaciones del usuario
      needItemRows = needItems
        .filter(
          (item: any) =>
            !item.campaign || orgIds.includes(item.campaign.organization_id)
        )
        .map((item: any) => ({
          id: item.id,
          campaign_id: item.campaign_id,
          campaign_name: item.campaign?.name ?? '',
          category: item.category,
          item_name: item.item_name,
          target_quantity: item.target_quantity,
          unit: item.unit,
          urgency: item.urgency as UrgencyLevel,
          status: item.status as NeedStatus,
          created_at: item.created_at,
          collection_points:
            item.need_items_collection_points
              ?.map((p: any) => ({
                id: p.collection_points?.id,
                location_adress: p.collection_points?.location_adress
              }))
              .filter((p: any) => p.id) ?? []
        }))
    }
  }

  return (
    <main className='min-h-screen bg-[var(--background)] px-4 py-8 font-sans text-[var(--ink)] antialiased sm:px-8 sm:py-12'>
      <div className='mx-auto max-w-6xl flex flex-col gap-8'>
        {/* Header Bar */}
        <header className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase'>
                Handly
              </span>
              <span className='text-xs text-[var(--muted)]'>•</span>
              <span className='text-xs font-medium text-[var(--muted)]'>
                {orgName}
              </span>
            </div>
            <h1 className='mt-1 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl'>
              Panel de Necesidades
            </h1>
            <p className='mt-1 text-sm text-[var(--muted)]'>
              Gestioná los ítems de asistencia requeridos para tus campañas
              activas.
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              href='/dashboard/needs/new'
              className='inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]'
            >
              + Nuevo ítem
            </Link>

            <form action={signOut}>
              <button
                type='submit'
                className='inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]'
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        {/* Diagnostic Banner if no org */}
        {orgIds.length === 0 && (
          <div className='rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800'>
            <p className='font-semibold'>
              ⚠️ No tenés ninguna organización vinculada todavía
            </p>
            <p className='mt-1 text-amber-700'>
              Conectado como:{' '}
              <code className='font-mono font-bold'>{user.email}</code>. Ejecutá
              el script SQL de inicialización en Supabase para vincular tu
              usuario.
            </p>
          </div>
        )}

        {/* Table Section */}
        <section className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-[var(--ink)]'>
              Ítems Registrados
            </h2>
          </div>

          <NeedItemsTable data={needItemRows} />
        </section>
      </div>
    </main>
  )
}
