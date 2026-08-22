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
  const isAdmin = memberships.some(
    (m) => m.role?.trim().toLowerCase() === "admin"
  );

  // 2. Obtener ítems de necesidad asociados a las organizaciones
  const needItemRows = await getDashboardNeedItems(orgIds);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
          Panel de Necesidades
        </h1>
        <p className="text-xs text-[var(--muted)] sm:text-sm">
          Gestioná los ítems de asistencia requeridos para tus campañas activas.
        </p>
      </div>

      <NeedItemsTable data={needItemRows} isAdmin={isAdmin} />
    </section>
  );
}
