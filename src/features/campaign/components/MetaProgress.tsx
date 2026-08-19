import type { FC } from 'react'

interface MetaProgressProps {
  targetQuantity: number
  unit: string
}

export const MetaProgress: FC<MetaProgressProps> = ({
  targetQuantity,
  unit
}) => {
  return (
    <div className='mt-3'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-[var(--muted)]'>
          Meta: {targetQuantity} {unit}
        </span>
        <span className='text-xs text-[var(--muted)]'>0%</span>
      </div>
      <div
        className='mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]'
        role='progressbar'
        aria-valuenow={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Progreso hacia la meta'
      >
        <div className='h-full w-0 bg-[var(--muted)]' />
      </div>
      <p className='mt-1 text-xs text-[var(--muted)]'>
        Sin compromisos registrados todavía.
      </p>
    </div>
  )
}
