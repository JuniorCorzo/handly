import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/features/auth/actions";
import { NeedItemsTable } from "@/features/needs/components/NeedItemsTable";
import type {
  NeedItemTableRow,
  UrgencyLevel,
  NeedStatus,
} from "@/features/needs/components/types";
import { getUserOrganizations } from "@/lib/organizations";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  // 1. Obtener membresías de la organización de forma resiliente
  const memberships = await getUserOrganizations(user.id, user.email);
  const orgIds = memberships.map((m) => m.org_id);
  const orgName = memberships[0]?.organization_name ?? "Mi Organización";
  const isAdmin = memberships.some(
    (m) => m.role?.trim().toLowerCase() === "admin"
  );

  // 2. Obtener ítems de necesidad con su campaña y centros de acopio
  let needItemRows: NeedItemTableRow[] = [];

  if (orgIds.length > 0) {
    const { data: needItems, error } = await db
      .from("need_items")
      .select(
        `
        id,
        campaign_id,
        category,
        item_name,
        target_quantity,
        unit,
        urgency,
        status,
        created_at,
        campaign (
          id,
          name,
          organization_id
        ),
        need_items_collection_points (
          collection_points (
            id,
            location_adress
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    interface NeedItemQueryItem {
      id: string;
      campaign_id: string;
      category: string;
      item_name: string;
      target_quantity: number;
      unit: string;
      urgency: string;
      status: string;
      created_at: string;
      campaign: {
        id: string;
        name: string;
        organization_id: string;
      } | null;
      need_items_collection_points:
        | {
            collection_points: {
              id: string;
              location_adress: string;
            } | null;
          }[]
        | null;
    }

    if (error) {
      console.error("[Dashboard] Error fetching need items:", error);
    } else if (needItems) {
      const items = needItems as unknown as NeedItemQueryItem[];
      const allowedOrgIds = new Set(orgIds);
      needItemRows = [];
      for (const item of items) {
        if (
          item.campaign &&
          !allowedOrgIds.has(item.campaign.organization_id)
        ) {
          continue;
        }
        const points: { id: string; location_adress: string }[] = [];
        for (const p of item.need_items_collection_points ?? []) {
          const pid = p.collection_points?.id ?? "";
          if (pid) {
            points.push({
              id: pid,
              location_adress: p.collection_points?.location_adress ?? "",
            });
          }
        }
        needItemRows.push({
          id: item.id,
          campaign_id: item.campaign_id,
          campaign_name: item.campaign?.name ?? "",
          category: item.category,
          item_name: item.item_name,
          target_quantity: item.target_quantity,
          unit: item.unit,
          urgency: item.urgency as UrgencyLevel,
          status: item.status as NeedStatus,
          created_at: item.created_at,
          collection_points: points,
        });
      }
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 font-sans text-[var(--ink)] antialiased sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
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
              Panel de Necesidades
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Gestioná los ítems de asistencia requeridos para tus campañas
              activas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/dashboard/needs/new"
                className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
              >
                + Nuevo ítem
              </Link>
            )}

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm font-medium text-[var(--ink)] shadow-2xs transition-colors hover:bg-[var(--background)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
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
            className="border-b-2 border-[var(--primary)] pb-3 font-semibold text-[var(--primary)]"
          >
            Ítems de Necesidad
          </Link>
          <Link
            href="/dashboard/intake"
            className="pb-3 font-medium text-[var(--muted)] hover:text-[var(--ink)]"
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

        {/* Diagnostic Banner if no org */}
        {orgIds.length === 0 && (
          <div className="rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <p className="font-semibold">
              ⚠️ No tenés ninguna organización vinculada todavía
            </p>
            <p className="mt-1 text-amber-700">
              Conectado como:{" "}
              <code className="font-mono font-bold">{user.email}</code>. Ejecutá
              el script SQL de inicialización en Supabase para vincular tu
              usuario.
            </p>
          </div>
        )}

        {/* Table Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Ítems Registrados
            </h2>
          </div>

          <NeedItemsTable data={needItemRows} isAdmin={isAdmin} />
        </section>
      </div>
    </main>
  );
}
