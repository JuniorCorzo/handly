"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import type { NeedItemTableRow, UrgencyLevel, NeedStatus } from "./types";

const URGENCY_RED = "bg-red-50 text-red-700 border-red-200" as const;
const URGENCY_CRITICAL = {
  label: "Crítico (4h)",
  className: URGENCY_RED,
} as const;

export const URGENCY_MAP: Record<
  UrgencyLevel,
  { label: string; className: string }
> = {
  critical_4h: URGENCY_CRITICAL,
  urgent_12h: {
    label: "Urgente (12h)",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  standard_24h: {
    label: "Estándar (24h)",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const GRAY_FALLBACK = "bg-gray-100 text-gray-700 border-gray-200" as const;
const STATUS_FALLBACK = {
  label: "Desconocido",
  className: GRAY_FALLBACK,
} as const;

export const STATUS_MAP: Record<
  NeedStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  fulfilled: {
    label: "Completado",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  cancelled: {
    label: "Cancelado",
    className: STATUS_FALLBACK.className,
  },
};

const COLLECTION_POINTS_HEADER = "Centros de Acopio" as const;
const baseColumns: ColumnDef<NeedItemTableRow>[] = [
  {
    accessorKey: "item_name",
    header: "Ítem",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--ink)]">
            {item.item_name}
          </span>
          <span className="text-xs text-[var(--muted)]">{item.category}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "campaign_name",
    header: "Campaña",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-[var(--ink)]">
        {row.original.campaign_name || "Sin campaña"}
      </span>
    ),
  },
  {
    accessorKey: "target_quantity",
    header: "Meta",
    cell: ({ row }) => {
      const { target_quantity, unit } = row.original;
      return (
        <span className="font-mono text-xs font-medium text-[var(--ink)]">
          {target_quantity}{" "}
          <span className="font-sans text-[var(--muted)]">{unit}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "urgency",
    header: "Urgencia",
    filterFn: (row, id, value) => (value ? row.getValue(id) === value : true),
    cell: ({ row }) => {
      const { urgency } = row.original;
      const config = URGENCY_MAP[urgency] ?? {
        label: urgency,
        className: GRAY_FALLBACK,
      };
      return (
        <span
          className={`inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-medium ${config.className}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    filterFn: (row, id, value) => (value ? row.getValue(id) === value : true),
    cell: ({ row }) => {
      const { status } = row.original;
      const config = STATUS_MAP[status] ?? {
        label: status,
        className: GRAY_FALLBACK,
      };
      return (
        <span
          className={`inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-medium ${config.className}`}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "collection_points",
    header: COLLECTION_POINTS_HEADER,
    cell: ({ row }) => {
      const points = row.original.collection_points;
      if (!points || points.length === 0) {
        return <span className="text-xs text-[var(--muted)]">Sin asignar</span>;
      }
      return (
        <div
          className="flex items-center gap-1.5"
          aria-label={points.map((p) => p.location_adress).join(", ")}
          role="group"
        >
          <span className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs font-medium text-[var(--ink)]">
            {points.length} {points.length === 1 ? "centro" : "centros"}
          </span>
        </div>
      );
    },
  },
];

export function getColumns(isAdmin = false): ColumnDef<NeedItemTableRow>[] {
  if (!isAdmin) {
    return baseColumns;
  }
  return [
    ...baseColumns,
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <Link
            href={`/dashboard/needs/${id}/edit`}
            className="inline-flex items-center rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:ring-1 focus:ring-[var(--focus)] focus:outline-none"
          >
            Editar
          </Link>
        );
      },
    },
  ];
}

export const columns: ColumnDef<NeedItemTableRow>[] = getColumns(false);
