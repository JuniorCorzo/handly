'use client'

import { useState } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState
} from '@tanstack/react-table'
import { DataTable } from '@/components/ui/table/DataTable'
import { DataTablePagination } from '@/components/ui/table/DataTablePagination'
import { NeedItemsTableToolbar } from './NeedItemsTableToolbar'
import { columns } from './columns'
import type { NeedItemTableRow } from './types'

interface NeedItemsTableProps {
  data: NeedItemTableRow[]
}

export function NeedItemsTable({ data }: NeedItemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  })

  return (
    <div className='flex flex-col gap-4 w-full'>
      <NeedItemsTableToolbar table={table} />
      <DataTable
        table={table}
        emptyMessage='No se encontraron ítems de necesidad registrados.'
      />
      <DataTablePagination table={table} />
    </div>
  )
}
