"use client";

import type { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@/components/ui/table/DataTableFacetedFilter";
import { DataTableSearchFilter } from "@/components/ui/table/DataTableSearchFilter";

import { STATUS_OPTIONS, URGENCY_OPTIONS } from "../lib/constants";
import type { NeedItemTableRow } from "../types";

interface NeedItemsTableToolbarProps {
  table: Table<NeedItemTableRow>;
}

export function NeedItemsTableToolbar({ table }: NeedItemsTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <DataTableSearchFilter
          column={table.getColumn("item_name")}
          placeholder="Buscar por nombre de ítem..."
        />

        {table.getColumn("urgency") && (
          <DataTableFacetedFilter
            column={table.getColumn("urgency")}
            title="Urgencia"
            options={
              URGENCY_OPTIONS as unknown as { label: string; value: string }[]
            }
          />
        )}

        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Estado"
            options={
              STATUS_OPTIONS as unknown as { label: string; value: string }[]
            }
          />
        )}

        {isFiltered && (
          <button
            type="button"
            onClick={() => table.resetColumnFilters()}
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
