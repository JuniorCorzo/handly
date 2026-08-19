import type { FC } from "react";

import { URGENCY_META } from "@/features/campaign/lib/urgency";
import type { UrgencyToken } from "@/features/campaign/lib/urgency";
import type { UrgencyLevel } from "@/lib/validations/need-item";

import { UrgencyIcon } from "./icons";

const URGENCY_BG: Record<UrgencyToken, string> = {
  critical: "var(--critical)",
  urgent: "var(--urgent)",
  standard: "var(--standard)",
};

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
}

export const UrgencyBadge: FC<UrgencyBadgeProps> = ({ urgency }) => {
  const meta = URGENCY_META[urgency];

  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: URGENCY_BG[meta.token] }}
      aria-label={`Urgencia ${meta.label}. ${meta.ttlLabel}.`}
    >
      <span aria-hidden="true">
        <UrgencyIcon urgency={urgency} />
      </span>
      {meta.label}
    </span>
  );
};
