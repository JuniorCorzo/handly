type NeedUrgency = 'critical' | 'urgent' | 'standard'

export type NeedCardProps = {
  id: string
  title: string
  urgency: NeedUrgency
  quantityNeeded: number
  unit: string
  zone: string
  zoneDetail?: string
  fulfillmentPercent: number
  deadlineLabel?: string
  onPledge?: () => void
}

const urgencyConfig: Record<
  NeedUrgency,
  { label: string; bg: string; fg: string; icon: string }
> = {
  critical: {
    label: 'Crítico',
    bg: 'bg-[var(--critical)]',
    fg: 'text-[var(--surface)]',
    icon: 'priority_high'
  },
  urgent: {
    label: 'Urgente',
    bg: 'bg-[var(--urgent)]',
    fg: 'text-[var(--surface)]',
    icon: 'warning'
  },
  standard: {
    label: 'Estándar',
    bg: 'bg-[var(--standard)]',
    fg: 'text-[var(--surface)]',
    icon: 'info'
  }
}

function UrgencyIcon({ name }: { name: string }) {
  if (name === 'priority_high') {
    return (
      <svg
        aria-hidden='true'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 9v4' />
        <path d='M12 17h.01' />
        <path d='M10.3 3.3 3.6 14.9a2 2 0 0 0 1.7 2.9h13.4a2 2 0 0 0 1.7-2.9L13.7 3.3a2 2 0 0 0-3.4 0Z' />
      </svg>
    )
  }
  if (name === 'warning') {
    return (
      <svg
        aria-hidden='true'
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M12 9v4' />
        <path d='M12 17h.01' />
        <circle cx='12' cy='12' r='10' />
      </svg>
    )
  }
  return (
    <svg
      aria-hidden='true'
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='12' cy='12' r='10' />
      <path d='M12 16v-4' />
      <path d='M12 8h.01' />
    </svg>
  )
}

export function NeedCard({
  id,
  title,
  urgency,
  quantityNeeded,
  unit,
  zone,
  zoneDetail,
  fulfillmentPercent,
  deadlineLabel,
  onPledge
}: NeedCardProps) {
  const cfg = urgencyConfig[urgency]
  const clamped = Math.max(0, Math.min(100, fulfillmentPercent))

  return (
    <article className='flex flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-shadow duration-200 hover:shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)]'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <span
          className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.fg}`}
        >
          <UrgencyIcon name={cfg.icon} />
          {cfg.label}
        </span>
        <span className='rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs text-[var(--muted)]'>
          {id}
        </span>
      </div>

      <h3 className='text-lg font-semibold leading-snug text-[var(--ink)] [text-wrap:balance]'>
        {title}
      </h3>

      <dl className='mt-4 flex flex-1 flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <dt className='text-sm text-[var(--muted)]'>Cantidad necesaria</dt>
          <dd className='font-mono text-sm font-medium text-[var(--ink)]'>
            {quantityNeeded} {unit}
          </dd>
        </div>
        <div className='flex items-start justify-between gap-4'>
          <dt className='text-sm text-[var(--muted)]'>Zona</dt>
          <dd className='text-right text-sm text-[var(--ink)]'>
            <span className='font-medium'>{zone}</span>
            {zoneDetail ? (
              <span className='block text-xs text-[var(--muted)]'>
                {zoneDetail}
              </span>
            ) : null}
          </dd>
        </div>
        {deadlineLabel ? (
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-[var(--muted)]'>Vigencia</dt>
            <dd className='text-sm text-[var(--ink)]'>{deadlineLabel}</dd>
          </div>
        ) : null}
      </dl>

      <div className='mt-4'>
        <div className='mb-1 flex justify-between font-mono text-xs text-[var(--muted)]'>
          <span>Avance</span>
          <span aria-live='polite'>{clamped}%</span>
        </div>
        <div className='h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--background)]'>
          <div
            className='h-full rounded-[var(--radius-pill)] bg-[var(--primary)] transition-all'
            style={{ width: `${clamped}%` }}
            role='progressbar'
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label='Avance de la necesidad'
          />
        </div>
      </div>

      <button
        type='button'
        onClick={onPledge}
        className='mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--surface)] transition-colors hover:bg-[var(--primary)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 active:translate-y-px'
      >
        <svg
          aria-hidden='true'
          width='18'
          height='18'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M11 12h2a4 4 0 0 1 4 4v2H7v-2a4 4 0 0 1 4-4Z' />
          <circle cx='12' cy='7' r='4' />
          <path d='M19 8v6' />
          <path d='M22 11v2' />
        </svg>
        Comprometerse
      </button>
    </article>
  )
}
