"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition, useEffect } from "react";

import { createCampaign } from "@/features/campaigns/actions";
import type { NeedItemActionState } from "@/features/needs/actions";
import { URGENCY_LEVELS, NeedItemErrorCode } from "@/lib/validations/need-item";

type Campaign = { id: string; name: string };
type CollectionPoint = { id: string; location_adress: string };

interface NeedItemFormProps {
  campaigns: Campaign[];
  collectionPoints: CollectionPoint[];
  action: (
    prev: NeedItemActionState | null,
    data: FormData
  ) => Promise<NeedItemActionState>;
  defaultValues?: {
    campaign_id?: string;
    category?: string;
    item_name?: string;
    target_quantity?: number;
    unit?: string;
    urgency?: string;
    collection_point_ids?: string[];
  };
  submitLabel?: string;
}

// ── Single source of truth for UI messages ──────────────────────────
const NEED_ITEM_MESSAGES: Record<string, string> = {
  [NeedItemErrorCode.CAMPAIGN_REQUIRED]: "Seleccioná una campaña válida.",
  [NeedItemErrorCode.CATEGORY_REQUIRED]: "La categoría es obligatoria.",
  [NeedItemErrorCode.CATEGORY_TOO_LONG]:
    "La categoría no puede superar los 100 caracteres.",
  [NeedItemErrorCode.ITEM_NAME_REQUIRED]: "El nombre del ítem es obligatorio.",
  [NeedItemErrorCode.ITEM_NAME_TOO_LONG]:
    "El nombre no puede superar los 255 caracteres.",
  [NeedItemErrorCode.QUANTITY_POSITIVE]:
    "La cantidad debe ser un número positivo.",
  [NeedItemErrorCode.UNIT_REQUIRED]: "La unidad es obligatoria.",
  [NeedItemErrorCode.UNIT_TOO_LONG]:
    "La unidad no puede superar los 50 caracteres.",
  [NeedItemErrorCode.URGENCY_INVALID]:
    "Seleccioná un nivel de urgencia válido.",
  [NeedItemErrorCode.COLLECTION_POINTS_REQUIRED]:
    "Seleccioná al menos un centro de acopio.",
  [NeedItemErrorCode.CREATE_FAILED]:
    "No se pudo crear el ítem. Intentá de nuevo.",
  [NeedItemErrorCode.UPDATE_FAILED]:
    "No se pudo actualizar el ítem. Intentá de nuevo.",
  [NeedItemErrorCode.PIVOT_LINK_FAILED]:
    "No se pudo vincular los centros de acopio. Intentá de nuevo.",
};

function msg(code: string): string {
  return NEED_ITEM_MESSAGES[code] ?? code;
}

const URGENCY_LABELS: Record<string, string> = {
  critical_4h: "Crítico (4h)",
  urgent_12h: "Urgente (12h)",
  standard_24h: "Estándar (24h)",
};

const inputClass =
  "mt-1 block w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]";
const labelClass = "block text-sm font-medium text-[var(--ink)]";
const errorClass = "mt-1 text-xs text-red-600";
const fieldClass = "flex flex-col gap-0.5";

// Extracted sub-components to reduce complexity of NeedItemForm
function CampaignField({
  campaigns: initialCampaigns,
  defaultCampaignId,
}: {
  campaigns: Campaign[];
  defaultCampaignId: string;
}) {
  const [campaignList, setCampaignList] =
    useState<Campaign[]>(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] =
    useState<string>(defaultCampaignId);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [isPendingCampaign, startCampaignTransition] = useTransition();

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) {
      return;
    }
    setCampaignError(null);
    startCampaignTransition(async () => {
      const fd = new FormData();
      fd.append("name", newCampaignName.trim());
      const result = await createCampaign(fd);
      if (result.success) {
        setCampaignList((prev) => [...prev, result.campaign]);
        setSelectedCampaign(result.campaign.id);
        setNewCampaignName("");
        setIsCreatingCampaign(false);
      } else {
        setCampaignError(result.error);
      }
    });
  };

  return (
    <div className={fieldClass}>
      <div className="flex items-center justify-between">
        <label htmlFor="campaign_id" className={labelClass}>
          Campaña <span aria-hidden="true">*</span>
        </label>
        <button
          type="button"
          onClick={() => setIsCreatingCampaign(true)}
          className="text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          + Nueva campaña
        </button>
      </div>
      {isCreatingCampaign ? (
        <div className="mt-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-3">
          <p className="text-xs font-medium text-[var(--ink)]">
            Crear nueva campaña
          </p>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              placeholder="Nombre de la campaña"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              className="flex-1 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:ring-1 focus:ring-[var(--focus)] focus:outline-none"
            />
            <button
              type="button"
              disabled={isPendingCampaign || !newCampaignName.trim()}
              onClick={handleCreateCampaign}
              className="rounded-[var(--radius-xs)] bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isPendingCampaign ? "Creando…" : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreatingCampaign(false);
                setCampaignError(null);
              }}
              className="rounded-[var(--radius-xs)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--surface)]"
            >
              Cancelar
            </button>
          </div>
          {campaignError && (
            <p className="mt-1 text-xs text-red-600">{campaignError}</p>
          )}
        </div>
      ) : (
        <select
          id="campaign_id"
          name="campaign_id"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          required
          className={inputClass}
        >
          <option value="">Seleccioná una campaña…</option>
          {campaignList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function CollectionPointsField({
  collectionPoints,
  defaultIds,
}: {
  collectionPoints: CollectionPoint[];
  defaultIds: string[];
}) {
  const selectedSet = new Set(defaultIds);
  return (
    <fieldset className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] p-4">
      <legend className="px-1 text-sm font-semibold text-[var(--ink)]">
        Centros de Acopio <span aria-hidden="true">*</span>
      </legend>
      {collectionPoints.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">
          No hay centros de acopio registrados para tu organización.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {collectionPoints.map((cp) => (
            <label
              key={cp.id}
              className="flex cursor-pointer items-start gap-2 text-sm text-[var(--ink)]"
            >
              <input
                type="checkbox"
                name="collection_point_ids"
                value={cp.id}
                defaultChecked={selectedSet.has(cp.id)}
                className="mt-1 rounded-[var(--radius-xs)] border-[var(--border)] text-[var(--primary)] focus:ring-[var(--focus)]"
              />
              <span>{cp.location_adress}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

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
  const defaultCampaignId = defaultValues?.campaign_id ?? "";
  const defaultPointIds = defaultValues?.collection_point_ids ?? [];

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
          className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {msg(code)}
        </p>
      ))}

      <CampaignField
        campaigns={campaigns}
        defaultCampaignId={defaultCampaignId}
      />
      {errors.campaign_id && (
        <p aria-live="polite" className={errorClass}>
          {msg(errors.campaign_id[0])}
        </p>
      )}

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
            {msg(errors.category[0])}
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
            {msg(errors.item_name[0])}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              {msg(errors.target_quantity[0])}
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
              {msg(errors.unit[0])}
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
            {msg(errors.urgency[0])}
          </p>
        )}
      </div>

      <CollectionPointsField
        collectionPoints={collectionPoints}
        defaultIds={defaultPointIds}
      />
      {errors.collection_point_ids && (
        <p aria-live="polite" className={errorClass}>
          {msg(errors.collection_point_ids[0])}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || state?.success}
          className="inline-flex flex-1 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
        >
          Cancelar
        </Link>
      </div>

      {state?.success && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-[var(--radius-sm)] border border-green-200 bg-green-50 py-2 text-center text-sm font-medium text-green-700"
        >
          ¡Ítem guardado exitosamente! Redirigiendo al panel...
        </p>
      )}
    </form>
  );
}
