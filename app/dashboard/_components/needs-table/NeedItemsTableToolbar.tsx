'use client'

import { type Table } from '@tanstack/react-table'
import { DataTableSearchFilter } from '@/components/ui/table/DataTableSearchFilter'
import { DataTableFacetedFilter } from '@/components/ui/table/DataTableFacetedFilter'
import type { NeedItemTableRow } from './types'

interface NeedItemsTableToolbarProps {
  table: Table<NeedItemTableRow>
}

const URGENCY_OPTIONS = [
  { label: 'Crítico (4h)', value: 'critical_4h' },
  { label: 'Urgente (12h)', value: 'urgent_12h' },
  { label: 'Estándar (24h)', value: 'standard_24h' }
]

const STATUS_OPTIONS = [
  { label: 'Activo', value: 'active' },
  { label: 'Completado', value: 'fulfilled' },
  { label: 'Cancelado', value: 'cancelled' }
]

export function NeedItemsTableToolbar({ table }: NeedItemsTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div className='flex flex-wrap items-center gap-2 flex-1'>
        <DataTableSearchFilter
          column={table.getColumn('item_name')}
          placeholder='Buscar por nombre de ítem...'
        />

        {table.getColumn('urgency') && (
          <DataTableFacetedFilter
            column={table.getColumn('urgency')}
            title='Urgencia'
            options={URGENCY_OPTIONS}
          />
        )}

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Estado'
            options={STATUS_OPTIONS}
          />
        )}

        {isFiltered && (
          <button
            type='button'
            onClick={() => table.resetColumnFilters()}
            className='rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors'
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
