import type { FC } from 'react'
import { UrgencyBadge } from './UrgencyBadge'
import { MetaProgress } from './MetaProgress'
import { PledgeButton } from './PledgeButton'
import { MapPinIcon } from './icons'
import { URGENCY_META } from '@/features/campaign/lib/urgency'
import type { PublicNeedItem } from '@/features/campaign/lib/types'

interface NeedCardProps {
  need: PublicNeedItem
}

function formatTime(time: string): string {
  // Supabase devuelve "HH:MM:SS"; recortamos a "HH:MM"
  return time.slice(0, 5)
}

export const NeedCard: FC<NeedCardProps> = ({ need }) => {
  const meta = URGENCY_META[need.urgency]
  const isDisabled = need.status !== 'active'

  const statusLabel =
    need.status === 'fulfilled'
      ? 'Agotado'
      : need.status === 'cancelled'
        ? 'Cancelado'
        : null

  return (
    <article className='relative rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none transition-shadow duration-150 hover:shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)]'>
      {statusLabel && (
        <span className='absolute top-4 right-4 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-white'>
          {statusLabel}
        </span>
      )}

      <header className='flex items-start justify-between gap-3'>
        <UrgencyBadge urgency={need.urgency} />
        <span className='text-xs font-medium text-[var(--muted)] uppercase'>
          {meta.ttlLabel}
        </span>
      </header>

      <div className='mt-3'>
        <span className='text-xs font-medium text-[var(--muted)] uppercase'>
          {need.category}
        </span>
        <h3 className='mt-1 text-lg font-semibold text-[var(--ink)] text-balance'>
          {need.itemName}
        </h3>
      </div>

      <MetaProgress targetQuantity={need.targetQuantity} unit={need.unit} />

      {need.collectionPoints.length > 0 && (
        <div className='mt-4 space-y-1.5'>
          {need.collectionPoints.map((cp) => (
            <div
              key={cp.id}
              className='flex items-center gap-2 text-sm text-[var(--ink)]'
            >
              <span aria-hidden='true' className='text-[var(--muted)]'>
                <MapPinIcon />
              </span>
              <span className='font-medium text-[var(--ink)]'>
                {cp.address}
              </span>
              {cp.opensAt && cp.closesAt && (
                <span className='text-[var(--muted)]'>
                  · {formatTime(cp.opensAt)}–{formatTime(cp.closesAt)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <footer className='mt-4'>
        <PledgeButton needItemId={need.id} disabled={isDisabled} />
      </footer>
    </article>
  )
}
