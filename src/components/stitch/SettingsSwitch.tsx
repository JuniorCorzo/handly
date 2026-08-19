'use client'

export type SettingsSwitchProps = {
  id: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label: string
  description?: string
}

export function SettingsSwitch({
  id,
  checked,
  onCheckedChange,
  label,
  description
}: SettingsSwitchProps) {
  return (
    <div className='flex items-center justify-between gap-4 border-b border-[var(--border)] p-4 last:border-b-0 hover:bg-[var(--background)]'>
      <div className='min-w-0'>
        <label
          htmlFor={id}
          className='cursor-pointer text-sm font-medium text-[var(--ink)]'
        >
          {label}
        </label>
        {description ? (
          <p className='mt-0.5 text-sm text-[var(--muted)] [text-wrap:pretty]'>
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        onClick={() => onCheckedChange(!checked)}
        className={
          checked
            ? 'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
            : 'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
        }
      >
        <span
          className={
            checked
              ? 'inline-block h-5 w-5 translate-x-5 rounded-full bg-[var(--surface)] shadow transition-transform'
              : 'inline-block h-5 w-5 translate-x-0.5 rounded-full bg-[var(--surface)] shadow transition-transform'
          }
        />
      </button>
    </div>
  )
}
