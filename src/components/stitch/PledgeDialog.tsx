"use client";

import { useState, useId, useRef } from "react";

import { SOSBadge } from "./SOSBadge";

type PledgeResult = { code: string };
type PledgeConfirmResult = PledgeResult | undefined;

export type PledgeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  urgencyLabel?: string;
  maxQuantity: number;
  defaultQuantity?: number;
  zoneHint: string;
  onConfirm: (
    quantity: number
  ) => Promise<PledgeConfirmResult> | PledgeConfirmResult;
  successCode?: string | null;
};

export function PledgeDialog({
  open,
  onOpenChange,
  title,
  urgencyLabel,
  maxQuantity,
  defaultQuantity = 1,
  zoneHint,
  onConfirm,
  successCode = null,
}: PledgeDialogProps) {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [localCode, setLocalCode] = useState<string | null>(successCode);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const titleId = `${id}-title`;

  const clamp = (n: number) =>
    Math.max(1, Math.min(maxQuantity, Math.trunc(n) || 1));

  const handleConfirm = async () => {
    setFormError(null);
    if (quantity < 1 || quantity > maxQuantity) {
      setFormError(`La cantidad debe estar entre 1 y ${maxQuantity}.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await onConfirm(quantity);
      const code = (res as { code?: string } | undefined)?.code ?? null;
      if (code) {
        setLocalCode(code);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? (error as Error).message
          : "No se pudo confirmar el compromiso."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayedCode = localCode ?? successCode;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Cerrar diálogo"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-[var(--ink)]/40"
      />
      <div className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[0_4px_12px_oklch(0.23_0.02_173/0.10)] sm:rounded-[var(--radius-md)]">
        <button
          type="button"
          aria-label="Cerrar diálogo"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--ink)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="border-b border-[var(--border)] px-6 pt-6 pb-4">
          {urgencyLabel ? (
            <p className="mb-2 text-xs font-semibold tracking-wider text-[var(--critical)] uppercase">
              {urgencyLabel}
            </p>
          ) : null}
          <h2
            id={titleId}
            className="pr-10 text-xl leading-tight font-semibold [text-wrap:balance] text-[var(--ink)]"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            Confirmá cuántas unidades podés acercar al centro de recepción.
          </p>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto p-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor={`${id}-qty`}
              className="text-sm font-medium text-[var(--ink)]"
            >
              Cantidad a comprometer
              <span className="ml-2 font-mono text-xs text-[var(--muted)]">
                Máx: {maxQuantity}
              </span>
            </label>

            <div className="relative flex items-center">
              <button
                type="button"
                aria-label="Reducir cantidad"
                onClick={() => setQuantity((q) => clamp(q - 1))}
                className="absolute top-0 bottom-0 left-0 inline-flex w-11 items-center justify-center border-r border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
              <input
                ref={inputRef}
                id={`${id}-qty`}
                name="quantity"
                type="number"
                inputMode="numeric"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(clamp(Number(e.target.value)))}
                aria-describedby={`${helperId} ${formError ? errorId : ""}`.trim()}
                aria-invalid={Boolean(formError)}
                className="h-12 w-full border border-[var(--border)] bg-[var(--surface)] px-14 text-center font-mono text-lg text-[var(--ink)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
              />
              <button
                type="button"
                aria-label="Aumentar cantidad"
                onClick={() => setQuantity((q) => clamp(q + 1))}
                className="absolute top-0 right-0 bottom-0 inline-flex w-11 items-center justify-center border-l border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            <p
              id={helperId}
              className="flex items-start gap-2 text-sm leading-snug text-[var(--muted)]"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="mt-0.5 shrink-0"
              >
                <path d="M12 13v-2" />
                <path d="M12 17h.01" />
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path d="M12 8a4 4 0 0 1 4 4" />
              </svg>
              {zoneHint}
            </p>
            {formError ? (
              <p
                id={errorId}
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--critical)]/20 bg-[var(--critical)]/10 px-3 py-2 text-sm text-[var(--critical)]"
              >
                {formError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-dashed border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              aria-busy={submitting}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--surface)] hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
            >
              {submitting ? "Confirmando…" : "Confirmar compromiso"}
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>

            {displayedCode ? (
              <div aria-live="polite">
                <SOSBadge code={displayedCode} label="Referencia" />
              </div>
            ) : (
              <p className="text-center text-xs text-[var(--muted)]">
                Al confirmar recibirás un código SOS para presentar en la
                recepción.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
