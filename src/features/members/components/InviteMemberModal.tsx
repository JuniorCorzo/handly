"use client";

import { useActionState, useState } from "react";

import { Select } from "@/components/ui/Select";
import { inviteMemberAction } from "@/features/members/actions";

interface InviteMemberModalProps {
  orgId: string;
}

export function InviteMemberModal({ orgId }: InviteMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: Parameters<typeof inviteMemberAction>[0],
      formData: FormData
    ) => {
      const res = await inviteMemberAction(prevState, formData);
      if (res.success) {
        setIsOpen(false);
      }
      return res;
    },
    null
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
      >
        + Invitar miembro
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h2
                id="invite-modal-title"
                className="text-lg font-bold text-[var(--ink)]"
              >
                Invitar nuevo miembro
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--ink)]"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form action={formAction} className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="org_id" value={orgId} />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-email"
                  className="text-sm font-medium text-[var(--ink)]"
                >
                  Correo electrónico del invitado
                </label>
                <input
                  id="invite-email"
                  name="email"
                  type="email"
                  required
                  placeholder="colaborador@organizacion.org"
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
                />
                {state?.fieldErrors?.email && (
                  <p className="text-xs text-[var(--critical)]">
                    {state.fieldErrors.email[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="invite-role"
                  className="text-sm font-medium text-[var(--ink)]"
                >
                  Rol en la organización
                </label>
                <Select
                  id="invite-role"
                  name="role"
                  defaultValue="operator"
                  items={[
                    {
                      value: "operator",
                      label: "Operador",
                      description: "Carga y gestión operativa de insumos",
                    },
                    {
                      value: "admin",
                      label: "Administrador",
                      description: "Control total y gestión del equipo",
                    },
                  ]}
                />
                {state?.fieldErrors?.role && (
                  <p className="text-xs text-[var(--critical)]">
                    {state.fieldErrors.role[0]}
                  </p>
                )}
              </div>

              <p className="text-xs text-[var(--muted)]">
                Se enviará un Magic Link de acceso al correo proporcionado. Si
                es su primera vez, completará sus datos antes de acceder al
                panel.
              </p>

              {state?.error && (
                <div className="rounded-[var(--radius-sm)] border border-[var(--critical)]/20 bg-[var(--critical)]/10 px-3 py-2 text-xs text-[var(--critical)]">
                  {state.error}
                </div>
              )}

              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--background)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Enviando..." : "Enviar invitación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
