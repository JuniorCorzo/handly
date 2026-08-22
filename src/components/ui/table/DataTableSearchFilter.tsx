"use client";

import type { Column } from "@tanstack/react-table";

interface DataTableSearchFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export function DataTableSearchFilter<TData, TValue>({
  column,
  placeholder = "Buscar...",
  value,
  onChange,
}: DataTableSearchFilterProps<TData, TValue>) {
  const filterValue =
    (value === undefined ? (column?.getFilterValue() as string) : value) ?? "";

  const handleChange = (val: string) => {
    if (onChange) {
      onChange(val);
    } else {
      column?.setFilterValue(val || undefined);
    }
  };

  return (
    <div className="relative max-w-sm min-w-[220px] flex-1">
      <input
        type="text"
        value={filterValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--ink)] shadow-2xs placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--focus)] focus:outline-none sm:text-sm"
      />
      {filterValue && (
        <button
          type="button"
          onClick={() => handleChange("")}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
          aria-label="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
}
