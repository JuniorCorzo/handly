import { redirect } from "next/navigation";

import { DashboardHeader, DashboardNavTabs } from "@/features/dashboard";
import { getUserOrganizations } from "@/lib/organizations";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Obtener membresías de la organización de forma resiliente
  const memberships = await getUserOrganizations(user.id, user.email);
  const orgIds = memberships.map((m) => m.org_id);
  const [primaryMembership] = memberships;
  const userRole = primaryMembership?.role ?? "operador";
  const isAdmin = memberships.some(
    (m) => m.role?.trim().toLowerCase() === "admin"
  );

  const userName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split("@")[0] ||
    "Usuario";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--ink)] antialiased">
      {/* ── Global Header (Solo App, Nombre de Usuario y Cerrar Sesión) ── */}
      <DashboardHeader userName={userName} isAdmin={isAdmin} role={userRole} />

      {/* ── Dashboard Content & Separated Nav Tabs ────────────── */}
      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
          {/* Pestañas separadas de navegación */}
          <DashboardNavTabs isAdmin={isAdmin} />

          {/* Banner de diagnóstico si el usuario no tiene organizaciones asociadas */}
          {orgIds.length === 0 && (
            <div className="rounded-[var(--radius-sm)] border border-[var(--urgent)]/30 bg-[var(--urgent)]/10 p-4 text-xs text-[var(--ink)] shadow-2xs">
              <p className="font-bold text-[var(--urgent)]">
                ⚠️ No tenés ninguna organización vinculada todavía
              </p>
              <p className="mt-1 text-[var(--muted)]">
                Conectado como:{" "}
                <code className="font-mono font-bold text-[var(--ink)]">
                  {user.email}
                </code>
                . Ejecutá el script SQL de inicialización en Supabase para
                vincular tu usuario a una organización.
              </p>
            </div>
          )}

          {/* Contenido de la tab respectiva */}
          <div className="flex flex-col gap-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
