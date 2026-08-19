import Link from "next/link";
import { redirect } from "next/navigation";

import { createNeedItem } from "@/features/needs/actions";
import { NeedItemForm } from "@/features/needs/components/NeedItemForm";
import { createClient } from "@/lib/supabase/server";

// Opt into blocking prerender — page uses cookies() via createClient
export const instant = false;

export default async function NewNeedItemPage() {
  // ⚠️ createClient is server-only — uses cookies()
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: memberships, error: memErr } = await supabase
    .from("org_members")
    .select("org_id, role")
    .eq("auth_user_id", user.id);

  if (memErr) {
    console.error("[Dashboard Needs] Error fetching memberships:", memErr);
  }

  const orgIds = memberships?.map((m) => m.org_id) ?? [];
  const isAdmin =
    memberships?.some((m) => m.role === "admin") ?? orgIds.length > 0;

  let campaigns: { id: string; name: string }[] = [];
  let collectionPoints: { id: string; location_adress: string }[] = [];

  if (orgIds.length > 0) {
    const [campRes, cpRes] = await Promise.all([
      supabase
        .from("campaign")
        .select("id, name")
        .in("organization_id", orgIds),
      supabase
        .from("collection_points")
        .select("id, location_adress")
        .in("organization_id", orgIds),
    ]);

    if (campRes.error) {
      console.error(
        "[Dashboard Needs] Error fetching campaigns:",
        campRes.error
      );
    }
    if (cpRes.error) {
      console.error(
        "[Dashboard Needs] Error fetching collection points:",
        cpRes.error
      );
    }

    campaigns = campRes.data ?? [];
    collectionPoints = cpRes.data ?? [];
  }

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
              Nuevo ítem de necesidad
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Completá los campos para publicar un requerimiento de asistencia.
            </p>
          </div>
        </div>

        {orgIds.length === 0 && (
          <div className="mb-6 rounded-[var(--radius-sm)] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <p className="font-semibold">
              ⚠️ No tenés ninguna organización vinculada todavía
            </p>
            <p className="mt-1 text-amber-700">
              Tu usuario autenticado actual es:{" "}
              <code className="font-mono font-bold">{user.email}</code> (ID:{" "}
              <code className="font-mono text-[10px]">{user.id}</code>).
            </p>
            <p className="mt-2 text-amber-700">
              Para ver tus campañas y centros de acopio, tu ID de usuario debe
              figurar en la tabla{" "}
              <code className="font-mono font-bold">org_members</code> con el ID
              de tu organización.
            </p>
          </div>
        )}

        <NeedItemForm
          campaigns={campaigns}
          collectionPoints={collectionPoints}
          action={createNeedItem}
          isAdmin={isAdmin}
        />
      </div>
    </main>
  );
}
