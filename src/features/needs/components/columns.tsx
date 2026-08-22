"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { STATUS_MAP, URGENCY_MAP } from "../lib/constants";
import type { NeedItemTableRow, NeedStatus, UrgencyLevel } from "../types";

export { STATUS_MAP, URGENCY_MAP };

const GRAY_FALLBACK = "bg-gray-100 text-gray-700 border-gray-200" as const;
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
      const config = URGENCY_MAP[urgency as UrgencyLevel] ?? {
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
      const config = STATUS_MAP[status as NeedStatus] ?? {
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
