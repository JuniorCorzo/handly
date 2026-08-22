"use client";

import type { IntakeReceipt } from "@/src/features/intake/types";

interface IntakeSuccessReceiptProps {
  receipt: IntakeReceipt;
  onNext: () => void;
}

export function IntakeSuccessReceipt({
  receipt,
  onNext,
}: IntakeSuccessReceiptProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-md sm:p-8">
      {/* Success Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm">
        <svg
          aria-hidden="true"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <span className="inline-block rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3.5 py-1 font-mono text-xs font-bold text-[var(--primary)]">
          {receipt.short_code}
        </span>
        <h2 className="mt-2 text-xl font-extrabold text-[var(--ink)] sm:text-2xl">
          ¡Donación Recibida con Éxito!
        </h2>
        <p className="mt-1 text-xs font-medium text-[var(--muted)] sm:text-sm">
          El inventario físico y la necesidad remanente se actualizaron en
          tiempo real.
        </p>
      </div>

      {/* Summary Box */}
      <div className="w-full max-w-md rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-5 text-left shadow-xs">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Ítem Ingresado
            </span>
            <span className="text-sm font-bold text-[var(--ink)]">
              {receipt.need_item_name}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Cantidad Entregada
            </span>
            <span className="text-lg font-extrabold text-[var(--primary)]">
              {receipt.quantity} {receipt.unit}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Donante
            </span>
            <span className="text-sm font-bold text-[var(--ink)]">
              {receipt.donor_name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Tipo de Recepción
            </span>
            <span className="rounded-sm border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--ink)]">
              {receipt.is_direct
                ? "Donación en Puerta (Directa)"
                : "Promesa Online Verificada"}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
      >
        Recepcionar Siguiente Donación
      </button>
    </div>
  );
}
