"use client";

import { useState } from "react";

import { CodeIntakeForm } from "@/src/features/intake/components/CodeIntakeForm";
import { DirectDonationForm } from "@/src/features/intake/components/DirectDonationForm";
import { IntakeSuccessReceipt } from "@/src/features/intake/components/IntakeSuccessReceipt";
import { PledgeVerificationCard } from "@/src/features/intake/components/PledgeVerificationCard";
import { useDirectDonationIntake } from "@/src/features/intake/hooks/useDirectDonationIntake";
import { usePledgeByCodeIntake } from "@/src/features/intake/hooks/usePledgeByCodeIntake";
import type { ActiveNeedOption, IntakeMode } from "@/src/features/intake/types";

interface IntakeViewProps {
  activeNeeds: ActiveNeedOption[];
}

export function IntakeView({ activeNeeds }: IntakeViewProps) {
  const [activeTab, setActiveTab] = useState<IntakeMode>("code");

  // Hooks encapsulando estado y lógica de negocio (SRP & SOLID)
  const codeHook = usePledgeByCodeIntake();
  const directHook = useDirectDonationIntake();

  function handleSwitchTab(tab: IntakeMode) {
    setActiveTab(tab);
    if (tab === "code") {
      directHook.handleReset();
    } else {
      codeHook.handleReset();
    }
  }

  function renderCodeFlow() {
    if (codeHook.receipt) {
      return (
        <IntakeSuccessReceipt
          receipt={codeHook.receipt}
          onNext={codeHook.handleReset}
        />
      );
    }

    if (codeHook.verifiedPledge) {
      return (
        <PledgeVerificationCard
          pledge={codeHook.verifiedPledge}
          isConfirming={codeHook.isConfirming}
          onConfirm={codeHook.handleConfirmReceipt}
          onCancel={codeHook.handleReset}
        />
      );
    }

    return (
      <CodeIntakeForm
        code={codeHook.code}
        isLoading={codeHook.isLoading}
        error={codeHook.error}
        onCodeChange={codeHook.setCode}
        onSubmit={codeHook.handleSearch}
      />
    );
  }

  function renderDirectFlow() {
    if (directHook.receipt) {
      return (
        <IntakeSuccessReceipt
          receipt={directHook.receipt}
          onNext={directHook.handleReset}
        />
      );
    }

    return (
      <DirectDonationForm
        activeNeeds={activeNeeds}
        needItemId={directHook.needItemId}
        quantity={directHook.quantity}
        donorName={directHook.donorName}
        donorEmail={directHook.donorEmail}
        donorPhone={directHook.donorPhone}
        isSubmitting={directHook.isSubmitting}
        error={directHook.error}
        fieldErrors={directHook.fieldErrors}
        onNeedItemChange={directHook.setNeedItemId}
        onQuantityChange={directHook.setQuantity}
        onDonorNameChange={directHook.setDonorName}
        onDonorEmailChange={directHook.setDonorEmail}
        onDonorPhoneChange={directHook.setDonorPhone}
        onSubmit={directHook.handleSubmit}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Selector de Modo / Tabs */}
      <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-1">
        <button
          type="button"
          onClick={() => handleSwitchTab("code")}
          className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "code"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          1. Recepción por Código SOS
        </button>
        <button
          type="button"
          onClick={() => handleSwitchTab("direct")}
          className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "direct"
              ? "bg-[var(--primary)] text-white shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          2. Donación en Puerta (Sin Código)
        </button>
      </div>

      {/* Flujo Activo */}
      {activeTab === "code" ? renderCodeFlow() : renderDirectFlow()}
    </div>
  );
}
