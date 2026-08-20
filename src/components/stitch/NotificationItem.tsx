type NotificationKind =
  | "critical"
  | "urgent"
  | "standard"
  | "success"
  | "reminder";

export type NotificationItemProps = {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  timestamp: string | Date;
  actionLabel?: string;
  onAction?: () => void;
};

const kindMap: Record<
  NotificationKind,
  {
    pill: string;
    label: string;
    icon: "critical" | "urgent" | "standard" | "success" | "reminder";
  }
> = {
  critical: {
    pill: "bg-[var(--critical)] text-[var(--surface)]",
    label: "Crítico",
    icon: "critical",
  },
  urgent: {
    pill: "bg-[var(--urgent)] text-[var(--surface)]",
    label: "Urgente",
    icon: "urgent",
  },
  standard: {
    pill: "bg-[var(--standard)] text-[var(--surface)]",
    label: "Estándar",
    icon: "standard",
  },
  success: {
    pill: "bg-[var(--success)] text-[var(--surface)]",
    label: "Entregado",
    icon: "success",
  },
  reminder: {
    pill: "bg-[var(--background)] text-[var(--ink)] border border-[var(--border)]",
    label: "Recordatorio",
    icon: "reminder",
  },
};

// Module-scope static: avoids per-render object recreation
const ICON_COMMON = {
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
} as const;

const DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function KindIcon({ kind }: { kind: NotificationKind }) {
  const common = ICON_COMMON;
  if (kind === "critical") {
    return (
      <svg
        aria-hidden="true"
        {...common}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.3 3.6 14.9a2 2 0 0 0 1.7 2.9h13.4a2 2 0 0 0 1.7-2.9L13.7 3.3a2 2 0 0 0-3.4 0Z" />
      </svg>
    );
  }
  if (kind === "urgent") {
    return (
      <svg
        aria-hidden="true"
        {...common}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v6" />
        <path d="M12 16h.01" />
      </svg>
    );
  }
  if (kind === "success") {
    return (
      <svg
        aria-hidden="true"
        {...common}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  if (kind === "reminder") {
    return (
      <svg
        aria-hidden="true"
        {...common}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      {...common}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function formatTimestamp(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  try {
    return DATE_FORMATTER.format(d);
  } catch {
    return d.toLocaleString("es-AR");
  }
}

export function NotificationItem({
  title,
  body,
  kind,
  timestamp,
  actionLabel,
  onAction,
}: NotificationItemProps) {
  const cfg = kindMap[kind];

  return (
    <li className="flex items-start gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--background)]">
      <span
        aria-hidden="true"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.pill}`}
      >
        <KindIcon kind={kind} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <span
              className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-semibold ${cfg.pill}`}
            >
              <KindIcon kind={kind} />
              {cfg.label}
            </span>
            <span className="[text-wrap:balance]">{title}</span>
          </h3>
          <time
            className="shrink-0 font-mono text-xs text-[var(--muted)]"
            dateTime={new Date(timestamp).toISOString()}
          >
            {formatTimestamp(timestamp)}
          </time>
        </div>
        <p className="mt-1 text-sm leading-relaxed [text-wrap:pretty] text-[var(--muted)]">
          {body}
        </p>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-3 inline-flex min-h-[44px] items-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </li>
  );
}

export type NotificationListProps = {
  children: React.ReactNode;
  label?: string;
};

export function NotificationList({
  children,
  label = "Notificaciones",
}: NotificationListProps) {
  return (
    <ul role="list" aria-label={label} className="flex flex-col gap-3">
      {children}
    </ul>
  );
}
