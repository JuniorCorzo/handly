'use client'

import { useId } from 'react'

export type FilterOption = { value: string; label: string; dotClass?: string }

export type NeedFiltersProps = {
  urgency: FilterOption[]
  category: FilterOption[]
  selectedUrgency: string
  selectedCategory: string
  onUrgencyChange: (v: string) => void
  onCategoryChange: (v: string) => void
  resultCount?: number
}

export function NeedFilters({
  urgency,
  category,
  selectedUrgency,
  selectedCategory,
  onUrgencyChange,
  onCategoryChange,
  resultCount
}: NeedFiltersProps) {
  const liveId = useId()

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='sr-only' id={`${liveId}-urgency-label`}>
          Filtrar por urgencia
        </span>
        <span className='sr-only' id={`${liveId}-category-label`}>
          Filtrar por categoría
        </span>

        {urgency.map((opt) => {
          const active = opt.value === selectedUrgency
          return (
            <button
              key={`u-${opt.value}`}
              type='button'
              aria-pressed={active}
              aria-labelledby={`${liveId}-urgency-label`}
              onClick={() => onUrgencyChange(opt.value)}
              className={
                active
                  ? 'inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
                  : 'inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
              }
            >
              {opt.dotClass ? (
                <span
                  aria-hidden='true'
                  className={`h-2 w-2 rounded-full ${opt.dotClass}`}
                />
              ) : null}
              {opt.label}
            </button>
          )
        })}

        <span aria-hidden='true' className='mx-1 h-6 w-px bg-[var(--border)]' />

        {category.map((opt) => {
          const active = opt.value === selectedCategory
          return (
            <button
              key={`c-${opt.value}`}
              type='button'
              aria-pressed={active}
              aria-labelledby={`${liveId}-category-label`}
              onClick={() => onCategoryChange(opt.value)}
              className={
                active
                  ? 'inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
                  : 'inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2'
              }
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {typeof resultCount === 'number' ? (
        <p aria-live='polite' className='text-sm text-[var(--muted)]'>
          {resultCount === 0
            ? 'Sin resultados con los filtros actuales.'
            : `${resultCount} ${resultCount === 1 ? 'necesidad encontrada' : 'necesidades encontradas'}.`}
        </p>
      ) : null}
    </div>
  )
}
