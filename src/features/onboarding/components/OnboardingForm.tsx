"use client";

import { useActionState } from "react";

import { completeOnboardingAction } from "@/features/onboarding/actions";

export function OnboardingForm({ userEmail }: { userEmail: string }) {
  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Email en solo lectura */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
          Correo Registrado
        </label>
        <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm text-[var(--muted)]">
          {userEmail}
        </div>
      </div>

      {/* Nombre completo */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="full_name"
          className="text-sm font-medium text-[var(--ink)]"
        >
          Nombre completo <span className="text-[var(--critical)]">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          placeholder="Ej. Martín González"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        />
        {state?.fieldErrors?.full_name && (
          <p className="text-xs text-[var(--critical)]">
            {state.fieldErrors.full_name[0]}
          </p>
        )}
      </div>

      {/* Teléfono de contacto */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="phone"
          className="text-sm font-medium text-[var(--ink)]"
        >
          Teléfono / WhatsApp de contacto{" "}
          <span className="text-[var(--critical)]">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="Ej. +54 9 11 1234-5678"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        />
        {state?.fieldErrors?.phone && (
          <p className="text-xs text-[var(--critical)]">
            {state.fieldErrors.phone[0]}
          </p>
        )}
      </div>

      {/* Cargo o rol en la organización */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="job_title"
          className="text-sm font-medium text-[var(--ink)]"
        >
          Cargo o función en la entidad{" "}
          <span className="text-xs text-[var(--muted)]">(Opcional)</span>
        </label>
        <input
          id="job_title"
          name="job_title"
          type="text"
          placeholder="Ej. Coordinador de Logística / Voluntario"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--critical)]/20 bg-[var(--critical)]/10 px-3.5 py-2.5 text-sm text-[var(--critical)]">
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:outline-none active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Guardando perfil..." : "Completar registro e ingresar"}
      </button>
    </form>
  );
}
