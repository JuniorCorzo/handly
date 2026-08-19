import type { ReactNode } from "react";

export type NeedGridProps = {
  children: ReactNode;
  emptyLabel?: string;
  "aria-label"?: string;
};

export function NeedGrid({
  children,
  emptyLabel = "No hay necesidades para mostrar.",
  "aria-label": ariaLabel = "Listado de necesidades",
}: NeedGridProps) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  if (!hasChildren) {
    return (
      <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-6"
    >
      {children}
    </div>
  );
}
