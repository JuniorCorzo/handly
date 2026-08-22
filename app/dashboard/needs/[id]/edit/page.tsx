import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateNeedItem } from "@/features/needs/actions";
import { NeedItemForm } from "@/features/needs/components/NeedItemForm";
import {
  getNeedItemById,
  getNeedItemFormData,
} from "@/features/needs/lib/queries";
import { getUserOrganizations } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function EditNeedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [itemResult, memberships] = await Promise.all([
    getNeedItemById(id),
    getUserOrganizations(user.id, user.email),
  ]);

  if (!itemResult) {
    notFound();
  }

  const isAdmin = memberships.some((m) => m.role === "admin");
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const orgIds = memberships.map((m) => m.org_id);
  const { campaigns, collectionPoints } = await getNeedItemFormData(orgIds);
  const { needItem, selectedPointIds } = itemResult;

  const boundAction = updateNeedItem.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-xl rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xs sm:p-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        >
          ← Volver al panel de necesidades
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
          Editar ítem de necesidad
        </h1>
        <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
          Actualizá los datos del requerimiento de asistencia.
        </p>
      </div>

      <NeedItemForm
        campaigns={campaigns}
        collectionPoints={collectionPoints}
        action={boundAction}
        defaultValues={{
          campaign_id: needItem.campaign_id,
          category: needItem.category,
          item_name: needItem.item_name,
          target_quantity: needItem.target_quantity,
          unit: needItem.unit,
          urgency: needItem.urgency,
          collection_point_ids: selectedPointIds,
        }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
