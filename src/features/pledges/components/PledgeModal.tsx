"use client";

import { useActionState, useState } from "react";

import { createPledge } from "@/src/features/pledges/actions";
import type { PledgeActionState } from "@/src/features/pledges/actions";
import { getPledgeErrorMessage } from "@/src/lib/validations/pledge";

interface CollectionPoint {
  id: string;
  location_adress: string;
}

interface NeedItemPublic {
  id: string;
  item_name: string;
  category: string;
  unit: string;
  urgency: string;
  target_quantity: number;
  campaign_name?: string;
  collection_points: CollectionPoint[];
}

interface PledgeModalProps {
  item: NeedItemPublic | null;
  onClose: () => void;
}

export function PledgeModal({ item, onClose }: PledgeModalProps) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState<
    PledgeActionState | null,
    FormData
  >(createPledge, null);

  if (!item) {
    return null;
  }

  const errors = state && !state.success ? state.errors : {};
  const pledge = state && state.success ? state.pledge : null;

  const handleCopyCode = () => {
    if (pledge?.short_code) {
      navigator.clipboard.writeText(pledge.short_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modal de compromiso de donación"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl sm:p-8">
        {pledge ? (
          /* ── Pantalla de Confirmación Exitosa ──────────────────── */
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
              ✓
            </div>
            <span className="mt-3 text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
              Compromiso Registrado
            </span>
            <h2 className="mt-1 text-2xl font-bold text-[var(--ink)]">
              ¡Gracias por tu ayuda!
            </h2>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Te enviamos una copia a{" "}
              <strong className="text-[var(--ink)]">
                {pledge.donor_email}
              </strong>
              . Presentá este código al entregar tu donación:
            </p>

            {/* Código SOS-XXXX */}
            <div className="my-5 w-full rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--primary)] bg-[var(--primary)]/5 p-4">
              <span className="text-xs font-semibold text-[var(--primary)]">
                CÓDIGO DE DONACIÓN
              </span>
              <div className="mt-1 font-mono text-3xl font-extrabold tracking-widest text-[var(--ink)]">
                {pledge.short_code}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-2 inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)]"
              >
                {copied ? "✓ Copiado" : "Copiar código"}
              </button>
            </div>

            {/* Resumen del compromiso */}
            <div className="mb-4 flex w-full flex-col gap-1.5 rounded-[var(--radius-sm)] bg-[var(--background)] p-3.5 text-left text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Insumo:</span>
                <strong className="font-medium text-[var(--ink)]">
                  {item.item_name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Cantidad:</span>
                <strong className="font-medium text-[var(--ink)]">
                  {pledge.quantity} {item.unit}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Vence:</span>
                <strong className="font-medium text-amber-700">
                  {new Date(pledge.expires_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  (
                  {new Date(pledge.expires_at).toLocaleDateString([], {
                    day: "2-digit",
                    month: "short",
                  })}
                  )
                </strong>
              </div>
            </div>

            {/* Puntos de entrega */}
            {item.collection_points.length > 0 && (
              <div className="mb-6 w-full text-left">
                <p className="mb-1 text-xs font-semibold text-[var(--ink)]">
                  Puntos de entrega habilitados:
                </p>
                <ul className="flex flex-col gap-1">
                  {item.collection_points.map((cp) => (
                    <li
                      key={cp.id}
                      className="flex items-start gap-1.5 text-xs text-[var(--muted)]"
                    >
                      <span className="text-[var(--primary)]">📍</span>
                      <span>{cp.location_adress}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-[var(--radius-sm)] bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Listo, cerrar
            </button>
          </div>
        ) : (
          /* ── Formulario de Reserva ────────────────────────────── */
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
                  {item.category}
                </span>
                <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">
                  Donar: {item.item_name}
                </h2>
                {item.campaign_name && (
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Campaña: {item.campaign_name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="p-1 text-lg leading-none text-[var(--muted)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            {/* Root Errors */}
            {errors._root?.map((code: string) => (
              <p
                key={code}
                role="alert"
                className="mt-4 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-xs text-red-700"
              >
                {getPledgeErrorMessage(code)}
              </p>
            ))}

            <form
              action={formAction}
              noValidate
              className="mt-5 flex flex-col gap-4"
            >
              <input type="hidden" name="need_item_id" value={item.id} />

              {/* Nombre del donante */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="donor_name"
                  className="text-xs font-medium text-[var(--ink)]"
                >
                  Tu Nombre o Institución <span aria-hidden="true">*</span>
                </label>
                <input
                  id="donor_name"
                  name="donor_name"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  required
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                />
                {errors.donor_name && (
                  <p className="text-xs text-red-600">
                    {getPledgeErrorMessage(errors.donor_name[0])}
                  </p>
                )}
              </div>

              {/* Correo electrónico */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="donor_email"
                  className="text-xs font-medium text-[var(--ink)]"
                >
                  Correo Electrónico <span aria-hidden="true">*</span>
                </label>
                <input
                  id="donor_email"
                  name="donor_email"
                  type="email"
                  placeholder="Ej: juan@email.com"
                  required
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                />
                {errors.donor_email && (
                  <p className="text-xs text-red-600">
                    {getPledgeErrorMessage(errors.donor_email[0])}
                  </p>
                )}
              </div>

              {/* Cantidad a donar */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="quantity"
                    className="text-xs font-medium text-[var(--ink)]"
                  >
                    Cantidad a comprometer ({item.unit}){" "}
                    <span aria-hidden="true">*</span>
                  </label>
                  <span className="text-xs text-[var(--muted)]">
                    Meta: {item.target_quantity} {item.unit}
                  </span>
                </div>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                />
                {errors.quantity && (
                  <p className="text-xs text-red-600">
                    {getPledgeErrorMessage(errors.quantity[0])}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-[var(--radius-sm)] bg-[var(--primary)] py-2.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {pending ? "Generando código SOS…" : "Confirmar Donación"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--background)]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
