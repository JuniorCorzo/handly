import Link from "next/link";
import { redirect } from "next/navigation";

import { NeedItemsTable } from "@/features/needs/components/NeedItemsTable";
import { getDashboardNeedItems } from "@/features/needs/lib/queries";
import { getUserOrganizations } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Obtener organizaciones del usuario
  const memberships = await getUserOrganizations(user.id, user.email);
  const orgIds = memberships.map((m) => m.org_id);
  const [primaryMembership] = memberships;
  const orgName = primaryMembership?.organization_name ?? "Mi Organización";
  const isAdmin = memberships.some(
    (m) => m.role?.trim().toLowerCase() === "admin"
  );

  // 2. Obtener ítems de necesidad asociados a las organizaciones
  const needItemRows = await getDashboardNeedItems(orgIds);

  return (
    <section className="flex flex-col gap-6">
      {/* ── Tab Header & Action ───────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
              Panel de Necesidades
            </h1>
            <span className="text-xs text-[var(--muted)]">•</span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink)] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              {orgName}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] sm:text-sm">
            Gestioná los ítems de asistencia requeridos para tus campañas
            activas.
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/dashboard/needs/new"
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-opacity hover:opacity-90 focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
          >
            <span>+</span>
            <span>Nuevo ítem</span>
          </Link>
        )}
      </div>

      <NeedItemsTable data={needItemRows} isAdmin={isAdmin} />
    </section>
  );
}
