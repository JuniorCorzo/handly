import type { FC } from "react";

import type { PublicCampaign } from "@/features/campaign/lib/types";

interface CampaignHeaderProps {
  campaign: PublicCampaign;
}

export const CampaignHeader: FC<CampaignHeaderProps> = ({ campaign }) => {
  const org = campaign.organization;
  const orgName = org?.name ?? "Organización";
  const zone = org?.zoneCode;
  const contact = org
    ? [org.email, org.phone].filter(Boolean).join(" · ")
    : null;

  return (
    <header className="mb-8 text-center sm:text-left">
      <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
        Handly
      </span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance text-[var(--ink)] sm:text-4xl">
        {campaign.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Por <span className="font-medium text-[var(--ink)]">{orgName}</span>
        {zone && (
          <>
            {" "}
            · <span className="font-medium text-[var(--ink)]">{zone}</span>
          </>
        )}
      </p>
      {contact && (
        <p className="mt-1 text-sm text-[var(--muted)]">
          Contacto:{" "}
          <span className="font-medium text-[var(--ink)]">{contact}</span>
        </p>
      )}
    </header>
  );
};
