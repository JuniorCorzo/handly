import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/features/auth/actions";
import { getUserOrganizations } from "@/lib/organizations";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { IntakeView } from "@/src/features/intake/components/IntakeView";
import type { ActiveNeedOption } from "@/src/features/intake/types";

export const instant = false;

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

  // 1. Obtener membresías de la organización
  const memberships = await getUserOrganizations(user.id, user.email);
  const orgIds = memberships.map((m) => m.org_id);
  const orgName = memberships[0]?.organization_name ?? "Mi Organización";
  const isAdmin = memberships.some((m) => m.role === "admin");

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
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 font-sans text-[var(--ink)] antialiased sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {/* Header Bar */}
        <header className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
                Handly
              </span>
              <span className="text-xs text-[var(--muted)]">•</span>
              <span className="text-xs font-medium text-[var(--muted)]">
                {orgName}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
              Recepción en Centro de Acopio
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Verificá códigos SOS o registrá donaciones físicas entregadas en
              puerta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:outline-none"
            >
              Volver al Panel
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:outline-none"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-4 border-b border-[var(--border)] text-sm">
          <Link
            href="/dashboard"
            className="pb-3 font-medium text-[var(--muted)] hover:text-[var(--ink)]"
          >
            Ítems de Necesidad
          </Link>
          <Link
            href="/dashboard/intake"
            className="border-b-2 border-[var(--primary)] pb-3 font-semibold text-[var(--primary)]"
          >
            Recepción de Donaciones
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/members"
              className="pb-3 font-medium text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Miembros del Equipo
            </Link>
          )}
        </nav>

        {/* Main Intake Flow Component */}
        <IntakeView activeNeeds={activeNeedOptions} />
      </div>
    </main>
  );
}
