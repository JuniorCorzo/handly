"use client";

import { useState } from "react";

import { recordDirectDonation } from "@/src/features/intake/actions";
import type { IntakeReceipt } from "@/src/features/intake/types";

export interface UseDirectDonationIntakeReturn {
  needItemId: string;
  quantity: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  receipt: IntakeReceipt | null;
  setNeedItemId: (id: string) => void;
  setQuantity: (q: string) => void;
  setDonorName: (name: string) => void;
  setDonorEmail: (email: string) => void;
  setDonorPhone: (phone: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleReset: () => void;
}

export function useDirectDonationIntake(
  initialNeedItemId = ""
): UseDirectDonationIntakeReturn {
  const [needItemId, setNeedItemId] = useState(initialNeedItemId);
  const [quantity, setQuantity] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [receipt, setReceipt] = useState<IntakeReceipt | null>(null);

  function handleReset() {
    setNeedItemId(initialNeedItemId);
    setQuantity("");
    setDonorName("");
    setDonorEmail("");
    setDonorPhone("");
    setIsSubmitting(false);
    setError(null);
    setFieldErrors({});
    setReceipt(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!needItemId) {
      setError("Seleccioná el ítem de necesidad.");
      return;
    }

    const numQuantity = Math.trunc(Number(quantity));
    if (Number.isNaN(numQuantity) || numQuantity <= 0) {
      setError("Ingresá una cantidad válida mayor a 0.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("need_item_id", needItemId);
    formData.append("quantity", quantity);
    if (donorName.trim()) {
      formData.append("donor_name", donorName.trim());
    }
    if (donorEmail.trim()) {
      formData.append("donor_email", donorEmail.trim());
    }
    if (donorPhone.trim()) {
      formData.append("donor_phone", donorPhone.trim());
    }

    try {
      const result = await recordDirectDonation(formData);
      if (result.success) {
        setReceipt(result.receipt);
      } else {
        setError(result.error);
        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }
    } catch {
      setError("Error al registrar la donación en puerta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    needItemId,
    quantity,
    donorName,
    donorEmail,
    donorPhone,
    isSubmitting,
    error,
    fieldErrors,
    receipt,
    setNeedItemId,
    setQuantity,
    setDonorName,
    setDonorEmail,
    setDonorPhone,
    handleSubmit,
    handleReset,
  };
}
