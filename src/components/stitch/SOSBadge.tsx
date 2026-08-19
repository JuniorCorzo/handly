'use client'

import { useState } from 'react'

export type SOSBadgeProps = {
  code: string
  onCopy?: () => void
  label?: string
}

export function SOSBadge({
  code,
  onCopy,
  label = 'Código de verificación'
}: SOSBadgeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may be unavailable in some contexts; do not throw
    }
  }

  return (
    <div className='flex flex-col items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5'>
      <span className='text-xs font-semibold uppercase tracking-wider text-[var(--muted)]'>
        {label}
      </span>
      <span
        aria-live='polite'
        className='rounded-[var(--radius-pill)] bg-[var(--ink)] px-4 py-2 font-mono text-lg font-bold tracking-widest text-[var(--surface)]'
      >
        {code}
      </span>
      <button
        type='button'
        onClick={handleCopy}
        aria-label={copied ? 'Código copiado' : `Copiar ${code}`}
        className='inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
      >
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
          <rect x='9' y='9' width='13' height='13' rx='2' />
          <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3' />
        </svg>
        {copied ? 'Copiado' : 'Copiar código'}
      </button>
      <span aria-live='polite' className='sr-only'>
        {copied ? 'Código copiado al portapapeles' : ''}
      </span>
    </div>
  )
}
