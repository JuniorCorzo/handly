"use client";

import { useState } from "react";

import { createNeedItem } from "../actions";
import type { CampaignOption, CollectionPointOption } from "../types";
import { NeedItemAIAssistant } from "./ai/NeedItemAIAssistant";
import { NeedItemForm } from "./NeedItemForm";

interface NewNeedItemTabsProps {
  campaigns: CampaignOption[];
  collectionPoints: CollectionPointOption[];
}

export function NewNeedItemTabs({
  campaigns,
  collectionPoints,
}: NewNeedItemTabsProps) {
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs Header */}
      <div
        className="flex gap-6 border-b border-[var(--border)]"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "ai"}
          onClick={() => setActiveTab("ai")}
          className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
            activeTab === "ai"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          Asistente con IA
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "manual"}
          onClick={() => setActiveTab("manual")}
          className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
            activeTab === "manual"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          Formulario manual
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "ai" ? (
        <NeedItemAIAssistant
          campaigns={campaigns}
          collectionPoints={collectionPoints}
        />
      ) : (
        <NeedItemForm
          campaigns={campaigns}
          collectionPoints={collectionPoints}
          action={createNeedItem}
        />
      )}
    </div>
  );
}
