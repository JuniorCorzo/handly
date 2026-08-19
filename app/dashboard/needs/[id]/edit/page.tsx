import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NeedItemForm } from '../../new/_components/NeedItemForm'
import { updateNeedItem } from '@/app/actions/need-items'

// Opt into blocking prerender — page uses cookies() via createClient
export const instant = false

export default async function EditNeedItemPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params // async params — required in Next.js 16

  // ⚠️ createClient is server-only — uses cookies()
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: needItem }, { data: memberships }] = await Promise.all([
    supabase
      .from('need_items')
      .select(
        `
        *,
        need_items_collection_points (
          collection_point_id
        )
      `
      )
      .eq('id', id)
      .single(),
    supabase
      .from('org_members')
      .select('org_id, role')
      .eq('auth_user_id', user.id)
  ])

  if (!needItem) notFound()

  const orgIds = memberships?.map((m: { org_id: string }) => m.org_id) ?? []
  const isAdmin =
    memberships?.some((m: { role: string }) => m.role === 'admin') ??
    orgIds.length > 0

  const [{ data: campaigns }, { data: collectionPoints }] = await Promise.all([
    supabase.from('campaign').select('id, name').in('organization_id', orgIds),
    supabase
      .from('collection_points')
      .select('id, location_adress')
      .in('organization_id', orgIds)
  ])

  const selectedPointIds =
    needItem.need_items_collection_points?.map(
      (p: { collection_point_id: string }) => p.collection_point_id
    ) ?? []

  const boundAction = updateNeedItem.bind(null, id)

  return (
    <main className='flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased'>
      <div className='w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10'>
        <div className='mb-6'>
          <Link
            href='/dashboard'
            className='inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] mb-3 transition-colors'
          >
            ← Volver al panel de necesidades
          </Link>
          <div>
            <span className='inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase'>
              Handly
            </span>
            <h1 className='mt-1 text-2xl font-bold tracking-tight text-[var(--ink)]'>
              Editar ítem de necesidad
            </h1>
            <p className='mt-2 text-sm text-[var(--muted)]'>
              Actualizá los datos del requerimiento de asistencia.
            </p>
          </div>
        </div>
        <NeedItemForm
          campaigns={campaigns ?? []}
          collectionPoints={collectionPoints ?? []}
          action={boundAction}
          defaultValues={{
            campaign_id: needItem.campaign_id,
            category: needItem.category,
            item_name: needItem.item_name,
            target_quantity: needItem.target_quantity,
            unit: needItem.unit,
            urgency: needItem.urgency,
            collection_point_ids: selectedPointIds
          }}
          submitLabel='Guardar cambios'
          isAdmin={isAdmin}
        />
      </div>
    </main>
  )
}
