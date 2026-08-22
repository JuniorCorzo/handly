import { redirect } from "next/navigation";

import { getUserOrganizations } from "@/lib/organizations";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { IntakeView } from "@/src/features/intake/components/IntakeView";
import type { ActiveNeedOption } from "@/src/features/intake/types";

export const instant = false;

interface NeedItemQueryItem {
  id: string;
  category: string;
  item_name: string;
  target_quantity: number;
  unit: string;
  status: string;
  campaign: {
    id: string;
    name: string;
    organization_id: string;
  } | null;
}

export default async function IntakePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  // 1. Obtener organizaciones del usuario
  const memberships = await getUserOrganizations(user.id, user.email);
  const orgIds = memberships.map((m) => m.org_id);
  const [primaryMembership] = memberships;
  const orgName = primaryMembership?.organization_name ?? "Mi Organización";

  // 2. Obtener ítems de necesidad activos de la organización para el selector de donación directa
  const activeNeedOptions: ActiveNeedOption[] = [];

  if (orgIds.length > 0) {
    const { data: needItems, error } = await db
      .from("need_items")
      .select(
        `
        id,
        category,
        item_name,
        target_quantity,
        unit,
        status,
        campaign (
          id,
          name,
          organization_id
        )
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[IntakePage] Error fetching need items:", error);
    } else if (needItems) {
      const items = needItems as unknown as NeedItemQueryItem[];
      const allowedOrgIds = new Set(orgIds);

      for (const item of items) {
        if (item.campaign && allowedOrgIds.has(item.campaign.organization_id)) {
          activeNeedOptions.push({
            id: item.id,
            item_name: item.item_name,
            category: item.category,
            unit: item.unit,
            target_quantity: item.target_quantity,
            campaign_name: item.campaign.name ?? "",
            campaign_id: item.campaign.id ?? "",
          });
        }
      }
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
            Recepción en Centro de Acopio
          </h1>
          <span className="text-xs text-[var(--muted)]">•</span>
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink)] shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            {orgName}
          </span>
        </div>
        <p className="text-xs text-[var(--muted)] sm:text-sm">
          Verificá códigos SOS o registrá donaciones físicas entregadas en
          puerta.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl pt-2">
        <IntakeView activeNeeds={activeNeedOptions} />
      </div>
    </section>
  );
}
