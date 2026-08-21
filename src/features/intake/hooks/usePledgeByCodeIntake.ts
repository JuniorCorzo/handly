"use client";

import { useState } from "react";

import {
  verifyPledgeByCode,
  confirmPledgeReceipt,
} from "@/src/features/intake/actions";
import type {
  VerifiedPledgeDetails,
  IntakeReceipt,
} from "@/src/features/intake/types";
import { normalizeShortCode } from "@/src/lib/validations/intake";

export interface UsePledgeByCodeIntakeReturn {
  code: string;
  formattedCode: string;
  isLoading: boolean;
  isConfirming: boolean;
  error: string | null;
  verifiedPledge: VerifiedPledgeDetails | null;
  receipt: IntakeReceipt | null;
  setCode: (code: string) => void;
  handleSearch: (e?: React.FormEvent) => Promise<void>;
  handleConfirmReceipt: () => Promise<void>;
  handleReset: () => void;
}

export function usePledgeByCodeIntake(): UsePledgeByCodeIntakeReturn {
  const [code, setCodeState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedPledge, setVerifiedPledge] =
    useState<VerifiedPledgeDetails | null>(null);
  const [receipt, setReceipt] = useState<IntakeReceipt | null>(null);

  function setCode(value: string) {
    const upper = value.toUpperCase();
    setCodeState(upper);
    setError(null);
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) {
      e.preventDefault();
    }

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Ingresá un código para buscar.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerifiedPledge(null);
    setReceipt(null);

    try {
      const result = await verifyPledgeByCode(trimmed);
      if (result.success) {
        setVerifiedPledge(result.pledge);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Ocurrió un error al buscar el compromiso.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmReceipt() {
    if (!verifiedPledge) {
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      const result = await confirmPledgeReceipt(verifiedPledge.id);
      if (result.success) {
        setReceipt(result.receipt);
        setVerifiedPledge(null);
      } else {
        setError(result.error);
      }
    } catch {
      setError("No se pudo confirmar la recepción física.");
    } finally {
      setIsConfirming(false);
    }
  }

  function handleReset() {
    setCodeState("");
    setIsLoading(false);
    setIsConfirming(false);
    setError(null);
    setVerifiedPledge(null);
    setReceipt(null);
  }

  return {
    code,
    formattedCode: normalizeShortCode(code),
    isLoading,
    isConfirming,
    error,
    verifiedPledge,
    receipt,
    setCode,
    handleSearch,
    handleConfirmReceipt,
    handleReset,
  };
}
