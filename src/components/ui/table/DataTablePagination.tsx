"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";

import { Select } from "@/components/ui/Select";

interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTablePaginationProps<TData>) {
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-3 text-xs text-[var(--muted)] sm:flex-row">
      <div className="flex items-center gap-2">
        <span>
          Total:{" "}
          <strong className="font-semibold text-[var(--ink)]">
            {totalRows}
          </strong>{" "}
          ítems
        </span>
        <span>•</span>
        <span>
          Página{" "}
          <strong className="font-semibold text-[var(--ink)]">
            {pageCount === 0 ? 0 : pageIndex + 1}
          </strong>{" "}
          de{" "}
          <strong className="font-semibold text-[var(--ink)]">
            {pageCount}
          </strong>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span>Filas por página:</span>
          <div className="w-20">
            <Select
              value={String(table.getState().pagination.pageSize)}
              onChange={(val) => table.setPageSize(Number(val))}
              buttonClassName="min-h-[32px] px-2 py-1 text-xs"
              items={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Primera página"
          >
            «
          </button>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Página anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Página siguiente"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] disabled:pointer-events-none disabled:opacity-40"
            aria-label="Última página"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
