"use client";

interface CodeIntakeFormProps {
  code: string;
  isLoading: boolean;
  error: string | null;
  onCodeChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CodeIntakeForm({
  code,
  isLoading,
  error,
  onCodeChange,
  onSubmit,
}: CodeIntakeFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="short-code-input"
          className="text-sm font-semibold text-[var(--ink)]"
        >
          Código Corto del Donante
        </label>
        <p className="text-xs text-[var(--muted)]">
          Ingresá el código alfanumérico proporcionado por el donante (ej:{" "}
          <span className="font-mono font-medium text-[var(--primary)]">
            SOS-87B2
          </span>{" "}
          o simplemente{" "}
          <span className="font-mono font-medium text-[var(--primary)]">
            87B2
          </span>
          ).
        </p>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="short-code-input"
              type="text"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="SOS-XXXX"
              maxLength={8}
              autoFocus
              autoComplete="off"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-lg font-bold tracking-wider text-[var(--ink)] uppercase placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
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
                Buscando...
              </span>
            ) : (
              "Buscar Donación"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
