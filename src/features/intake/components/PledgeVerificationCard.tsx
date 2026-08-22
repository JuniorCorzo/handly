"use client";

import type { VerifiedPledgeDetails } from "@/src/features/intake/types";

interface PledgeVerificationCardProps {
  pledge: VerifiedPledgeDetails;
  isConfirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PledgeVerificationCard({
  pledge,
  isConfirming,
  onConfirm,
  onCancel,
}: PledgeVerificationCardProps) {
  const isAlreadyReceived = pledge.status === "received";
  const isCancelled = pledge.status === "cancelled";

  return (
    <div className="flex flex-col gap-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      {/* Top Banner / Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-mono text-xl font-bold tracking-wider text-[var(--primary)]">
            {pledge.short_code}
          </span>
          {isAlreadyReceived && (
            <span className="inline-flex items-center rounded-full border border-[var(--standard)]/30 bg-[var(--standard)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--standard)]">
              ✓ Ya Recibido
            </span>
          )}
          {isCancelled && (
            <span className="inline-flex items-center rounded-full border border-[var(--critical)]/30 bg-[var(--critical)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--critical)]">
              Cancelado
            </span>
          )}
          {!isAlreadyReceived && !isCancelled && !pledge.is_expired && (
            <span className="inline-flex items-center rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--success)]">
              ● Pendiente de Entrega
            </span>
          )}
          {!isAlreadyReceived && !isCancelled && pledge.is_expired && (
            <span className="inline-flex items-center rounded-full border border-[var(--urgent)]/30 bg-[var(--urgent)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--urgent)]">
              ⚠️ Expirado
            </span>
          )}
        </div>

        <span className="text-xs text-[var(--muted)]">
          Campaña:{" "}
          <strong className="text-[var(--ink)]">{pledge.campaign.name}</strong>
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {/* Item Data */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-4">
          <span className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
            Ítem Comprometido
          </span>
          <div>
            <h3 className="text-base font-bold text-[var(--ink)] sm:text-lg">
              {pledge.need_item.item_name}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Categoría: {pledge.need_item.category}
            </p>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--primary)] sm:text-3xl">
              {pledge.quantity}
            </span>
            <span className="text-xs font-medium text-[var(--muted)] sm:text-sm">
              {pledge.need_item.unit}
            </span>
          </div>
        </div>

        {/* Donor Data */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-4">
          <span className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
            Información del Donante
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">
              {pledge.donor_name}
            </p>
            <p className="text-xs text-[var(--muted)]">{pledge.donor_email}</p>
            {pledge.donor_phone && (
              <p className="text-xs text-[var(--muted)]">
                Tel: {pledge.donor_phone}
              </p>
            )}
          </div>

          <div className="mt-2 text-xs text-[var(--muted)]">
            <p>
              Compromiso creado:{" "}
              {new Date(pledge.created_at).toLocaleString("es-AR")}
            </p>
            <p>
              Vencimiento: {new Date(pledge.expires_at).toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isConfirming}
          className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:outline-none sm:text-sm"
        >
          Buscar otro código
        </button>

        {!isAlreadyReceived && !isCancelled && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {isConfirming ? (
              <span className="flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Confirmando Recepción...
              </span>
            ) : (
              "✓ Confirmar Entrega Física e Ingreso"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
