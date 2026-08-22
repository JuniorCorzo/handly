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

// Opt into blocking prerender — page uses cookies() via createClient
export const instant = false;

export default async function EditNeedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // async params — required in Next.js 16
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
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased">
      <div className="w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            ← Volver al panel de necesidades
          </Link>
          <div>
            <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
              Handly
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--ink)]">
              Editar ítem de necesidad
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Actualizá los datos del requerimiento de asistencia.
            </p>
          </div>
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
    </main>
  );
}
