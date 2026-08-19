import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignHeader } from "@/features/campaign/components/CampaignHeader";
import { NeedCard } from "@/features/campaign/components/NeedCard";
import { getPublicCampaign } from "@/features/campaign/lib/queries";

export const instant = false;

interface Params {
  id: string;
}

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return { title: "Handly — Campaña no encontrada" };
  }

  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    return { title: "Handly — Campaña no encontrada" };
  }

  const org = campaign.organization?.name ?? "Handly";

  return {
    title: `${campaign.name} — ${org}`,
    description: `Doná a ${campaign.name}. Organizado por ${org}.`,
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    notFound();
  }

  const campaign = await getPublicCampaign(id);

  if (!campaign) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 font-sans text-[var(--ink)] antialiased sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <CampaignHeader campaign={campaign} />

        {campaign.needs.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              No hay necesidades activas en esta campaña.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaign.needs.map((need) => (
              <NeedCard key={need.id} need={need} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
