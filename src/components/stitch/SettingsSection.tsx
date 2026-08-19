import type { ReactNode } from 'react'

export type SettingsSectionProps = {
  title: string
  id: string
  children: ReactNode
}

export function SettingsSection({ title, id, children }: SettingsSectionProps) {
  return (
    <section aria-labelledby={id} className='space-y-3'>
      <h2
        id={id}
        className='text-xs font-semibold uppercase tracking-wider text-[var(--muted)]'
      >
        {title}
      </h2>
      <div className='overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]'>
        {children}
      </div>
    </section>
  )
}

export type SettingsRowProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function SettingsRow({ title, description, action }: SettingsRowProps) {
  return (
    <div className='flex items-center justify-between gap-4 border-b border-[var(--border)] p-4 last:border-b-0 hover:bg-[var(--background)]'>
      <div className='min-w-0'>
        <p className='text-sm font-medium text-[var(--ink)]'>{title}</p>
        {description ? (
          <p className='mt-0.5 text-sm leading-snug text-[var(--muted)] [text-wrap:pretty]'>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  )
}

export type SettingsLinkProps = {
  label: string
  href?: string
  onClick?: () => void
}

export function SettingsLink({
  label,
  href = '#',
  onClick
}: SettingsLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className='flex items-center justify-between p-4 text-sm text-[var(--ink)] hover:bg-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
    >
      <span>{label}</span>
      <svg
        aria-hidden='true'
        width='18'
        height='18'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.75'
        className='text-[var(--muted)]'
      >
        <path d='M9 18l6-6-6-6' />
      </svg>
    </a>
  )
}
