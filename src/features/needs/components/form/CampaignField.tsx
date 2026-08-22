"use client";

import { useState, useTransition } from "react";

import { createCampaign } from "@/features/campaigns/actions";

import type { CampaignOption } from "../../types";

interface CampaignFieldProps {
  campaigns: CampaignOption[];
  defaultCampaignId?: string;
  error?: string;
}

const inputClass =
  "mt-1 block w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]";
const labelClass = "block text-sm font-medium text-[var(--ink)]";
const fieldClass = "flex flex-col gap-0.5";

export function CampaignField({
  campaigns: initialCampaigns,
  defaultCampaignId = "",
  error,
}: CampaignFieldProps) {
  const [campaignList, setCampaignList] =
    useState<CampaignOption[]>(initialCampaigns);
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

      {error && (
        <p aria-live="polite" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
