'use client'

import { useState } from 'react'

interface PledgeButtonProps {
  needItemId: string
  disabled?: boolean
}

export function PledgeButton({ needItemId, disabled }: PledgeButtonProps) {
  const [pledged, setPledged] = useState(false)

  if (pledged) {
    return (
      <div
        className='rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-sm text-[var(--muted)]'
        role='status'
        aria-live='polite'
        data-need-id={needItemId}
      >
        El compromiso de donación estará disponible próximamente.
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={() => setPledged(true)}
      disabled={disabled}
      data-need-id={needItemId}
      className='w-full rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
    >
      Pledge to help
    </button>
  )
}
