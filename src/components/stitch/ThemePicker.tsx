"use client";

export type ThemeValue = "light" | "dark" | "system";

export type ThemePickerProps = {
  value: ThemeValue;
  onChange: (v: ThemeValue) => void;
};

const options: { value: ThemeValue; label: string; icon: string }[] = [
  { value: "light", label: "Claro", icon: "sun" },
  { value: "dark", label: "Oscuro", icon: "moon" },
  { value: "system", label: "Sistema", icon: "system" },
];

function ThemeIcon({ name }: { name: string }) {
  if (name === "sun") {
    return (
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
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  if (name === "moon") {
    return (
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
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    );
  }
  return (
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
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <fieldset className="p-4">
      <legend className="sr-only">Elegir tema</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={opt.value}
                checked={active}
                onChange={() => onChange(opt.value)}
                className="peer sr-only"
              />
              <span
                className={
                  active
                    ? "flex flex-col items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--primary)] bg-[var(--primary)]/10 px-3 py-3 text-sm font-medium text-[var(--primary)]"
                    : "flex flex-col items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm font-medium text-[var(--muted)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--focus)] peer-focus-visible:ring-offset-2 hover:bg-[var(--background)] hover:text-[var(--ink)]"
                }
              >
                <ThemeIcon name={opt.icon} />
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
