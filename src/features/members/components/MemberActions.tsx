"use client";

import { useEffect, useState, useTransition } from "react";

import {
  resendInvitationAction,
  revokeInvitationAction,
  removeMemberAction,
} from "@/features/members/actions";

export function ResendInvitationButton({
  invitationId,
}: {
  invitationId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleResend = () => {
    startTransition(async () => {
      const res = await resendInvitationAction(invitationId);
      if (res.success) {
        setFeedback({ type: "success", message: "¡Reenviado! ✓" });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Error al reenviar",
        });
      }
    });
  };

  if (feedback) {
    return (
      <span
        className={`text-xs font-semibold ${
          feedback.type === "success"
            ? "text-emerald-600"
            : "text-[var(--critical)]"
        }`}
      >
        {feedback.message}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleResend}
      disabled={isPending}
      className="text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-50"
    >
      {isPending ? "Reenviando..." : "Reenviar link"}
    </button>
  );
}

export function RevokeInvitationButton({
  invitationId,
}: {
  invitationId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleRevoke = () => {
    startTransition(async () => {
      await revokeInvitationAction(invitationId);
      setIsConfirming(false);
    });
  };

  if (isConfirming) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRevoke}
          disabled={isPending}
          className="text-xs font-bold text-[var(--critical)] hover:underline disabled:opacity-50"
        >
          {isPending ? "Cancelando..." : "¿Confirmar?"}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="text-xs text-[var(--muted)] hover:underline"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      disabled={isPending}
      className="text-xs font-medium text-[var(--critical)] hover:underline disabled:opacity-50"
    >
      Cancelar
    </button>
  );
}

export function RemoveMemberButton({
  orgId,
  memberAuthId,
  isSelf,
}: {
  orgId: string;
  memberAuthId: string;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleRemove = () => {
    startTransition(async () => {
      await removeMemberAction(orgId, memberAuthId);
      setIsConfirming(false);
    });
  };

  if (isConfirming) {
    let confirmLabel = "¿Confirmar baja?";
    if (isPending) {
      confirmLabel = "Eliminando...";
    } else if (isSelf) {
      confirmLabel = "¿Salir de la org?";
    }

    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="text-xs font-bold text-[var(--critical)] hover:underline disabled:opacity-50"
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="text-xs text-[var(--muted)] hover:underline"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      disabled={isPending}
      className="text-xs font-medium text-[var(--critical)] hover:underline disabled:opacity-50"
    >
      {isSelf ? "Salir" : "Eliminar"}
    </button>
  );
}
