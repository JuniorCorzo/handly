'use client'

import { type Column } from '@tanstack/react-table'

interface DataTableSearchFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  placeholder?: string
  value?: string
  onChange?: (val: string) => void
}

export function DataTableSearchFilter<TData, TValue>({
  column,
  placeholder = 'Buscar...',
  value,
  onChange
}: DataTableSearchFilterProps<TData, TValue>) {
  const filterValue =
    (value !== undefined ? value : (column?.getFilterValue() as string)) ?? ''

  const handleChange = (val: string) => {
    if (onChange) {
      onChange(val)
    } else {
      column?.setFilterValue(val || undefined)
    }
  }

  return (
    <div className='relative min-w-[200px] flex-1 max-w-sm'>
      <input
        type='text'
        value={filterValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className='w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink)] placeholder:text-[var(--muted)] shadow-2xs focus:outline-none focus:ring-1 focus:ring-[var(--focus)]'
      />
      {filterValue && (
        <button
          type='button'
          onClick={() => handleChange('')}
          className='absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--ink)]'
          title='Limpiar búsqueda'
        >
          ×
        </button>
      )}
    </div>
  )
}
