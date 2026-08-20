export type OnboardingStep = {
  title: string;
  description: string;
  icon: "list" | "pledge" | "dropoff";
};

const defaultSteps: OnboardingStep[] = [
  {
    title: "Explorá necesidades",
    description:
      "Consultá los requerimientos vigentes en tu zona, en tiempo real.",
    icon: "list",
  },
  {
    title: "Comprometete con insumos",
    description:
      "Reservá los insumos que podés acercar a un centro de recepción.",
    icon: "pledge",
  },
  {
    title: "Entregá en el centro",
    description:
      "Presentá tu código SOS en la recepción para la distribución inmediata.",
    icon: "dropoff",
  },
];

function StepIcon({ kind }: { kind: OnboardingStep["icon"] }) {
  if (kind === "list") {
    return (
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </svg>
    );
  }
  if (kind === "pledge") {
    return (
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export type OnboardingStepsProps = {
  steps?: OnboardingStep[];
  ctaHref?: string;
  ctaLabel?: string;
};

export function OnboardingSteps({
  steps = defaultSteps,
  ctaHref = "#como-funciona",
  ctaLabel = "Comenzar",
}: OnboardingStepsProps) {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col">
      <header className="mb-12">
        <p className="mb-8 flex items-center gap-2 text-[var(--primary)]">
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.3 3.6 14.9a2 2 0 0 0 1.7 2.9h13.4a2 2 0 0 0 1.7-2.9L13.7 3.3a2 2 0 0 0-3.4 0Z" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Handly</span>
        </p>
        <h1 className="text-3xl leading-tight font-bold tracking-tight [text-wrap:balance] text-[var(--ink)] sm:text-4xl">
          Ayudá exactamente donde hace falta.
        </h1>
      </header>

      <ol className="flex flex-col gap-10" aria-label="Cómo funciona">
        {steps.map((step) => (
          <li key={step.title} className="flex items-start gap-6">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-[var(--primary)]"
            >
              <StepIcon kind={step.icon} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                {step.title}
              </h2>
              <p className="text-sm leading-relaxed [text-wrap:pretty] text-[var(--muted)]">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 border-t border-[var(--border)] pt-8">
        <a
          href={ctaHref}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--surface)] hover:bg-[var(--primary)]/90 focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
