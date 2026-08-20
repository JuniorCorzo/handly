"use client";

import { useState, useActionState } from "react";

import { completeOnboardingAction } from "@/features/onboarding/actions";

interface OnboardingFormProps {
  userEmail: string;
  invitationOrgName?: string | null;
  isOrgCreator?: boolean;
}

export function OnboardingForm({
  userEmail,
  invitationOrgName,
  isOrgCreator = false,
}: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    null
  );

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStep1Error("Por favor ingresá tu nombre completo.");
      return;
    }
    if (!phone.trim()) {
      setStep1Error("Por favor ingresá tu teléfono de contacto.");
      return;
    }
    setStep1Error(null);
    setCurrentStep(2);
  };

  const handlePrevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setStep1Error(null);
    setCurrentStep(1);
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* Barra de Progreso de Pasos (Solo si es creador de organización) */}
      {isOrgCreator && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[var(--muted)] uppercase">
            <span
              className={
                currentStep === 1
                  ? "font-bold text-[var(--primary)]"
                  : "text-[var(--ink)]"
              }
            >
              1. Datos Personales
            </span>
            <span
              className={
                currentStep === 2
                  ? "font-bold text-[var(--primary)]"
                  : "text-[var(--muted)]"
              }
            >
              2. Tu Organización
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full bg-[var(--primary)] transition-[width] duration-300 ease-out"
              style={{ width: currentStep === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>
      )}

      {/* Banner de Invitación si aplica */}
      {invitationOrgName && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--primary)]">
          <p className="font-semibold">¡Bienvenido al equipo!</p>
          <p className="mt-0.5 text-xs opacity-90">
            Te estás uniendo a la organización{" "}
            <strong className="font-semibold text-[var(--ink)]">
              {invitationOrgName}
            </strong>
            .
          </p>
        </div>
      )}

      {/* ── PASO 1: DATOS PERSONALES ─────────────────────────────────── */}
      <div
        className={
          isOrgCreator && currentStep === 2 ? "hidden" : "flex flex-col gap-4"
        }
      >
        {isOrgCreator && (
          <div className="border-b border-[var(--border)] pb-2">
            <h2 className="text-base font-bold text-[var(--ink)]">
              Paso 1: Tus Datos de Contacto
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Información de la persona responsable de la cuenta.
            </p>
          </div>
        )}

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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. +54 9 11 1234-5678"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
          />
          {state?.fieldErrors?.phone && (
            <p className="text-xs text-[var(--critical)]">
              {state.fieldErrors.phone[0]}
            </p>
          )}
        </div>

        {/* Cargo o rol en la entidad */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="job_title"
            className="text-sm font-medium text-[var(--ink)]"
          >
            Cargo o función{" "}
            <span className="text-xs text-[var(--muted)]">(Opcional)</span>
          </label>
          <input
            id="job_title"
            name="job_title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={
              isOrgCreator
                ? "Ej. Director / Coordinador General"
                : "Ej. Operador Logístico / Voluntario"
            }
            className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
          />
        </div>

        {step1Error && (
          <div className="rounded-[var(--radius-sm)] border border-[var(--critical)]/20 bg-[var(--critical)]/10 px-3.5 py-2 text-xs text-[var(--critical)]">
            {step1Error}
          </div>
        )}

        {isOrgCreator ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="mt-3 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none active:scale-[0.98]"
          >
            Continuar a Datos de Organización →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="mt-3 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none active:scale-[0.98] disabled:opacity-50"
          >
            {isPending
              ? "Guardando perfil..."
              : "Completar Registro e Ingresar"}
          </button>
        )}
      </div>

      {/* ── PASO 2: DATOS DE LA ORGANIZACIÓN ─────────────────────────── */}
      {isOrgCreator && (
        <div className={currentStep === 2 ? "flex flex-col gap-4" : "hidden"}>
          <div className="border-b border-[var(--border)] pb-2">
            <h2 className="text-base font-bold text-[var(--ink)]">
              Paso 2: Datos de tu Organización
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Información de la entidad u ONG que recibirá donaciones.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="organization_name"
              className="text-sm font-medium text-[var(--ink)]"
            >
              Nombre de la entidad{" "}
              <span className="text-[var(--critical)]">*</span>
            </label>
            <input
              id="organization_name"
              name="organization_name"
              type="text"
              required={isOrgCreator && currentStep === 2}
              placeholder="Ej. Fundación Manos Abiertas / Cruz Roja"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            />
            {state?.fieldErrors?.organization_name && (
              <p className="text-xs text-[var(--critical)]">
                {state.fieldErrors.organization_name[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="organization_phone"
                className="text-sm font-medium text-[var(--ink)]"
              >
                Teléfono institucional{" "}
                <span className="text-[var(--critical)]">*</span>
              </label>
              <input
                id="organization_phone"
                name="organization_phone"
                type="tel"
                required={isOrgCreator && currentStep === 2}
                placeholder="Ej. +54 11 4000-0000"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
              />
              {state?.fieldErrors?.organization_phone && (
                <p className="text-xs text-[var(--critical)]">
                  {state.fieldErrors.organization_phone[0]}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="zone_code"
                className="text-sm font-medium text-[var(--ink)]"
              >
                Zona / Localidad{" "}
                <span className="text-xs text-[var(--muted)]">(Opcional)</span>
              </label>
              <input
                id="zone_code"
                name="zone_code"
                type="text"
                placeholder="Ej. CABA / Gran Córdoba"
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
              />
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--critical)]/20 bg-[var(--critical)]/10 px-3.5 py-2.5 text-sm text-[var(--critical)]">
              <span>{state.error}</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--background)] focus:outline-none"
            >
              ← Volver
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] shadow-xs transition-colors hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none active:scale-[0.98] disabled:opacity-50"
            >
              {isPending
                ? "Creando organización..."
                : "Crear Organización e Ingresar"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
