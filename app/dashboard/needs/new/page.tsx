import Link from "next/link";
import { redirect } from "next/navigation";

import { NewNeedItemTabs } from "@/features/needs/components/NewNeedItemTabs";
import { getNeedItemFormData } from "@/features/needs/lib/queries";
import { getUserOrganizations } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function NewNeedItemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const memberships = await getUserOrganizations(user.id, user.email);
  const isAdmin = memberships.some((m) => m.role === "admin");
  if (!isAdmin) {
    redirect("/dashboard");
  }
  const orgIds = memberships.map((m) => m.org_id);
  const { campaigns, collectionPoints } = await getNeedItemFormData(orgIds);

  return (
    <div className="mx-auto w-full max-w-2xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xs sm:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          ← Volver al panel de necesidades
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
          Nuevo ítem de necesidad
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
          Elegí entre crear el requerimiento asistido por IA o completarlo
          manualmente.
        </p>
      </div>

      <NewNeedItemTabs
        campaigns={campaigns}
        collectionPoints={collectionPoints}
      />
    </div>
  );
}
