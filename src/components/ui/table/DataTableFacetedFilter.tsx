"use client";

import type { Column } from "@tanstack/react-table";

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title: string;
  options: FilterOption[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValue = (column?.getFilterValue() as string) ?? "";

  return (
    <div className="flex items-center">
      <select
        value={selectedValue}
        onChange={(e) => {
          const val = e.target.value;
          column?.setFilterValue(val === "" ? undefined : val);
        }}
        className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--ink)] shadow-2xs focus:ring-1 focus:ring-[var(--focus)] focus:outline-none"
      >
        <option value="">{title}: Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
