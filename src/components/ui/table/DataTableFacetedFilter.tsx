"use client";

import type { Column } from "@tanstack/react-table";

import { Select } from "@/components/ui/Select";

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

  const items = [
    { value: "", label: `${title}: Todos` },
    ...options.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  ];

  return (
    <div className="flex w-44 shrink-0 items-center">
      <Select
        value={selectedValue}
        onChange={(val) => {
          column?.setFilterValue(val === "" ? undefined : val);
        }}
        placeholder={`${title}: Todos`}
        items={items}
        buttonClassName="!h-9 text-xs sm:text-sm !px-3"
      />
    </div>
  );
}
