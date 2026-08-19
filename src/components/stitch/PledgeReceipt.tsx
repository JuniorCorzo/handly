import Image from "next/image";

import { SOSBadge } from "./SOSBadge";

export type PledgeReceiptVariant = "operational" | "success";

export type PledgeReceiptProps = {
  variant?: PledgeReceiptVariant;
  sosCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  zoneLabel: string;
  zoneAddress: string;
  statusLabel: string;
  onOpenMap?: () => void;
  onNeedHelp?: () => void;
};

export function PledgeReceipt({
  variant = "operational",
  sosCode,
  itemName,
  quantity,
  unit,
  zoneLabel,
  zoneAddress,
  statusLabel,
  onOpenMap,
  onNeedHelp,
}: PledgeReceiptProps) {
  const isSuccess = variant === "success";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
          Estado: {statusLabel}
        </p>
        <h1 className="text-3xl font-bold tracking-tight [text-wrap:balance] text-[var(--ink)] sm:text-4xl">
          {isSuccess ? "Entrega confirmada" : "Compromiso confirmado"}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed [text-wrap:pretty] text-[var(--muted)] sm:text-base">
          {isSuccess
            ? "Tu aporte ya fue registrado y está en proceso de distribución. Gracias por tu ayuda."
            : "Acercate al centro de recepción. Presentá tu código SOS al llegar para agilizar el ingreso."}
        </p>
      </section>

      <SOSBadge code={sosCode} label="Código de verificación" />

      <section aria-labelledby="manifest-heading" className="space-y-3">
        <h2
          id="manifest-heading"
          className="border-b border-[var(--border)] pb-2 text-lg font-semibold text-[var(--ink)]"
        >
          Detalle
        </h2>
        <ul className="divide-y divide-[var(--border)]">
          <li className="flex items-center justify-between gap-4 py-3">
            <span className="flex items-center gap-2 text-sm text-[var(--ink)]">
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              {itemName}
            </span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-sm text-[var(--ink)]">
              {quantity} {unit}
            </span>
          </li>
          {isSuccess ? null : (
            <li className="flex items-center gap-2 py-3 text-sm text-[var(--muted)] opacity-75">
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              Pendiente de escaneo en tránsito
            </li>
          )}
        </ul>
      </section>

      <section aria-labelledby="logistics-heading" className="space-y-3">
        <h2
          id="logistics-heading"
          className="border-b border-[var(--border)] pb-2 text-lg font-semibold text-[var(--ink)]"
        >
          Logística
        </h2>
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
          <div className="relative h-32 w-full bg-[var(--background)]">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOY3AzHo85mOCl0H3SVtRA1i8ryO4cXtDcGuwW2ODCDgj0nEgonxbSPhbm__1-1qw4zL1h-ObGnhVGsMzKjGT420arpqnAsrHfu7VPc4-r7slqArUI5Sq6CP9H91h9Wy3Cw-EsrYoXpUuTJxtBdHb2Xn-W6-AOH2Ay3oKXSglNpGqvXfAv54C4RZ140FN_x-YyezTG8BXKikwt-hjaJJn8KH3WYGElFxjBszoK9CQ54WrH3p93LA"
              alt=""
              fill
              className="object-cover opacity-80"
              unoptimized
            />
            <span
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--surface)] shadow"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="mt-0.5 shrink-0 text-[var(--muted)]"
              >
                <path d="M3 9h18v10H3z" />
                <path d="M7 9V7a5 5 0 0 1 10 0v2" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">
                  {zoneLabel}
                </p>
                <p className="text-sm text-[var(--muted)]">{zoneAddress}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMap}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              Abrir mapa
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6">
        {isSuccess ? (
          <>
            <a
              href="/needs"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Volver a necesidades
            </a>
            <a
              href="/settings"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Ver perfil
            </a>
          </>
        ) : (
          <button
            type="button"
            onClick={onNeedHelp}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            ¿Necesitás ayuda?
          </button>
        )}
      </div>
    </div>
  );
}
