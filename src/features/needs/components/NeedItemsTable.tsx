"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useState } from "react";

import { DataTable } from "@/components/ui/table/DataTable";
import { DataTablePagination } from "@/components/ui/table/DataTablePagination";

import type { NeedItemTableRow } from "../types";
import { getColumns } from "./columns";
import { NeedItemsTableToolbar } from "./NeedItemsTableToolbar";

interface NeedItemsTableProps {
  data: NeedItemTableRow[];
  isAdmin?: boolean;
}

export function NeedItemsTable({ data, isAdmin = false }: NeedItemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tableColumns = getColumns(Boolean(isAdmin));

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <NeedItemsTableToolbar table={table} />
      <DataTable
        table={table}
        emptyMessage="No se encontraron ítems de necesidad registrados."
      />
      <DataTablePagination table={table} />
    </div>
  );
}
