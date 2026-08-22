"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { URGENCY_LEVELS } from "@/lib/validations/need-item";

import { getNeedItemErrorMessage, URGENCY_LABELS } from "../lib/constants";
import type {
  CampaignOption,
  CollectionPointOption,
  NeedItemActionState,
  NeedItemFormValues,
} from "../types";
import { CampaignField } from "./form/CampaignField";
import { CollectionPointsField } from "./form/CollectionPointsField";

interface NeedItemFormProps {
  campaigns: CampaignOption[];
  collectionPoints: CollectionPointOption[];
  action: (
    prev: NeedItemActionState | null,
    data: FormData
  ) => Promise<NeedItemActionState>;
  defaultValues?: NeedItemFormValues;
  submitLabel?: string;
}

const inputClass =
  "mt-1 block w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-[var(--ink)]";
const errorClass = "mt-1 text-xs font-medium text-[var(--critical)]";
const fieldClass = "flex flex-col gap-0.5";

export function NeedItemForm({
  campaigns,
  collectionPoints,
  action,
  defaultValues,
  submitLabel = "Crear ítem",
}: NeedItemFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    NeedItemActionState | null,
    FormData
  >(action, null);

  const errors = state && !state.success ? state.errors : {};

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {errors._root?.map((code) => (
        <p
          key={code}
          role="alert"
          aria-live="assertive"
          className="rounded-[var(--radius-sm)] border border-[var(--critical)]/30 bg-[var(--critical)]/10 px-4 py-3 text-xs font-medium text-[var(--critical)] sm:text-sm"
        >
          {getNeedItemErrorMessage(code)}
        </p>
      ))}

      <CampaignField
        campaigns={campaigns}
        defaultCampaignId={defaultValues?.campaign_id ?? ""}
        error={
          errors.campaign_id
            ? getNeedItemErrorMessage(errors.campaign_id[0])
            : undefined
        }
      />

      <div className={fieldClass}>
        <label htmlFor="category" className={labelClass}>
          Categoría <span aria-hidden="true">*</span>
        </label>
        <input
          id="category"
          name="category"
          type="text"
          placeholder="Ej: Agua y Alimentos"
          defaultValue={defaultValues?.category}
          required
          className={inputClass}
        />
        {errors.category && (
          <p aria-live="polite" className={errorClass}>
            {getNeedItemErrorMessage(errors.category[0])}
          </p>
        )}
      </div>

      <div className={fieldClass}>
        <label htmlFor="item_name" className={labelClass}>
          Nombre del ítem <span aria-hidden="true">*</span>
        </label>
        <input
          id="item_name"
          name="item_name"
          type="text"
          placeholder="Ej: Agua Potable (Bidones 5L)"
          defaultValue={defaultValues?.item_name}
          required
          className={inputClass}
        />
        {errors.item_name && (
          <p aria-live="polite" className={errorClass}>
            {getNeedItemErrorMessage(errors.item_name[0])}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={fieldClass}>
          <label htmlFor="target_quantity" className={labelClass}>
            Cantidad objetivo <span aria-hidden="true">*</span>
          </label>
          <input
            id="target_quantity"
            name="target_quantity"
            type="number"
            min="1"
            placeholder="0"
            defaultValue={defaultValues?.target_quantity}
            required
            className={inputClass}
          />
          {errors.target_quantity && (
            <p aria-live="polite" className={errorClass}>
              {getNeedItemErrorMessage(errors.target_quantity[0])}
            </p>
          )}
        </div>

        <div className={fieldClass}>
          <label htmlFor="unit" className={labelClass}>
            Unidad <span aria-hidden="true">*</span>
          </label>
          <input
            id="unit"
            name="unit"
            type="text"
            placeholder="Ej: bidones, cajas"
            defaultValue={defaultValues?.unit}
            required
            className={inputClass}
          />
          {errors.unit && (
            <p aria-live="polite" className={errorClass}>
              {getNeedItemErrorMessage(errors.unit[0])}
            </p>
          )}
        </div>
      </div>

      <div className={fieldClass}>
        <label htmlFor="urgency" className={labelClass}>
          Nivel de urgencia <span aria-hidden="true">*</span>
        </label>
        <select
          id="urgency"
          name="urgency"
          defaultValue={defaultValues?.urgency}
          required
          className={inputClass}
        >
          <option value="">Seleccioná urgencia…</option>
          {URGENCY_LEVELS.map((u) => (
            <option key={u} value={u}>
              {URGENCY_LABELS[u]}
            </option>
          ))}
        </select>
        {errors.urgency && (
          <p aria-live="polite" className={errorClass}>
            {getNeedItemErrorMessage(errors.urgency[0])}
          </p>
        )}
      </div>

      <CollectionPointsField
        collectionPoints={collectionPoints}
        defaultIds={defaultValues?.collection_point_ids}
        error={
          errors.collection_point_ids
            ? getNeedItemErrorMessage(errors.collection_point_ids[0])
            : undefined
        }
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || state?.success}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>

        <Link
          href="/dashboard"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        >
          Cancelar
        </Link>
      </div>

      {state?.success && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-[var(--radius-sm)] border border-[var(--success)]/30 bg-[var(--success)]/10 py-2.5 text-center text-xs font-semibold text-[var(--success)] sm:text-sm"
        >
          ¡Ítem guardado exitosamente! Redirigiendo al panel...
        </p>
      )}
    </form>
  );
}
