"use client";

import type { ActiveNeedOption } from "@/src/features/intake/types";

interface DirectDonationFormProps {
  activeNeeds: ActiveNeedOption[];
  needItemId: string;
  quantity: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  onNeedItemChange: (id: string) => void;
  onQuantityChange: (val: string) => void;
  onDonorNameChange: (val: string) => void;
  onDonorEmailChange: (val: string) => void;
  onDonorPhoneChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DirectDonationForm({
  activeNeeds,
  needItemId,
  quantity,
  donorName,
  donorEmail,
  donorPhone,
  isSubmitting,
  error,
  fieldErrors,
  onNeedItemChange,
  onQuantityChange,
  onDonorNameChange,
  onDonorEmailChange,
  onDonorPhoneChange,
  onSubmit,
}: DirectDonationFormProps) {
  const selectedNeed = activeNeeds.find((n) => n.id === needItemId);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-6 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs sm:p-6"
    >
      <div>
        <h3 className="text-base font-bold text-[var(--ink)] sm:text-lg">
          Registro de Donación en Puerta
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Utilizá este formulario para ingresar paquetes físicos entregados
          directamente en el centro de acopio sin una promesa previa online.
        </p>
      </div>

      {error && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--critical)]/30 bg-[var(--critical)]/10 p-3 text-xs font-medium text-[var(--critical)]">
          {error}
        </div>
      )}

      {/* Ítem de Necesidad */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="need-item-select"
          className="text-xs font-semibold tracking-wider text-[var(--ink)] uppercase"
        >
          Ítem de Asistencia Recibido *
        </label>
        <select
          id="need-item-select"
          value={needItemId}
          onChange={(e) => onNeedItemChange(e.target.value)}
          required
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        >
          <option value="">-- Seleccioná un ítem de necesidad --</option>
          {activeNeeds.map((need) => (
            <option key={need.id} value={need.id}>
              {need.item_name} ({need.category}) — Campaña: {need.campaign_name}
            </option>
          ))}
        </select>
        {fieldErrors.need_item_id && (
          <p className="text-xs font-medium text-[var(--critical)]">
            {fieldErrors.need_item_id[0]}
          </p>
        )}
      </div>

      {/* Cantidad y Unidad */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="quantity-input"
            className="text-xs font-semibold tracking-wider text-[var(--ink)] uppercase"
          >
            Cantidad Entregada *
          </label>
          <input
            id="quantity-input"
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            required
            placeholder="Ej: 50"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
          />
          {fieldErrors.quantity && (
            <p className="text-xs font-medium text-[var(--critical)]">
              {fieldErrors.quantity[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="unit-display"
            className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase"
          >
            Unidad de Medida
          </label>
          <input
            id="unit-display"
            type="text"
            readOnly
            value={selectedNeed?.unit ?? "—"}
            className="w-full cursor-not-allowed rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--muted)]"
          />
        </div>
      </div>

      {/* Datos del Donante */}
      <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-4">
        <h4 className="text-xs font-bold tracking-wider text-[var(--ink)] uppercase">
          Identificación del Donante (Opcional)
        </h4>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="donor-name-input"
            className="text-xs font-medium text-[var(--muted)]"
          >
            Nombre completo o Institución
          </label>
          <input
            id="donor-name-input"
            type="text"
            value={donorName}
            onChange={(e) => onDonorNameChange(e.target.value)}
            placeholder="Ej: Vecinos Unidos / Juan Pérez"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="donor-email-input"
              className="text-xs font-medium text-[var(--muted)]"
            >
              Correo Electrónico (para comprobante)
            </label>
            <input
              id="donor-email-input"
              type="email"
              value={donorEmail}
              onChange={(e) => onDonorEmailChange(e.target.value)}
              placeholder="donante@ejemplo.com"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            />
            {fieldErrors.donor_email && (
              <p className="text-xs font-medium text-[var(--critical)]">
                {fieldErrors.donor_email[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="donor-phone-input"
              className="text-xs font-medium text-[var(--muted)]"
            >
              Teléfono de Contacto
            </label>
            <input
              id="donor-phone-input"
              type="tel"
              value={donorPhone}
              onChange={(e) => onDonorPhoneChange(e.target.value)}
              placeholder="+54 9 11 1234-5678"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !needItemId || !quantity}
        className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
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
            Registrando Donación...
          </span>
        ) : (
          "✓ Confirmar Ingreso Directo a Inventario"
        )}
      </button>
    </form>
  );
}
