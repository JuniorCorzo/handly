"use client";

import { useFormStatus } from "react-dom";

import { signInWithMagicLink } from "../actions";

interface LoginFormProps {
  initialError?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <svg
            className="h-4 w-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <span>Enviando enlace de acceso…</span>
        </>
      ) : (
        <span>Enviar enlace de acceso</span>
      )}
    </button>
  );
}

export function LoginForm({ initialError }: LoginFormProps) {
  return (
    <form action={signInWithMagicLink} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-semibold tracking-wider text-[var(--ink)] uppercase"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="organizacion@ejemplo.org"
          className="block h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm text-[var(--ink)] shadow-2xs transition-colors placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        />
      </div>

      {initialError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-[var(--critical)]/30 bg-[var(--critical)]/10 px-3.5 py-3 text-xs text-[var(--critical)] sm:text-sm"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 fill-current"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span className="leading-relaxed font-medium">{initialError}</span>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
