import { redirect } from "next/navigation";

import { InviteMemberModal } from "@/features/members/components/InviteMemberModal";
import {
  RemoveMemberButton,
  ResendInvitationButton,
  RevokeInvitationButton,
} from "@/features/members/components/MemberActions";
import { getUserOrganizations } from "@/lib/organizations";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { OrgMemberRole } from "@/lib/validations/member";

export const instant = false;

interface OrgMemberRow {
  auth_user_id: string;
  org_id: string;
  role: OrgMemberRole;
  created_at?: string | null;
}

interface InvitationRow {
  id: string;
  org_id: string;
  email: string;
  role: OrgMemberRole;
  status: string;
  expires_at: string;
  created_at: string;
}

interface UserProfileMeta {
  email?: string;
  full_name?: string;
  job_title?: string;
}

export default async function MembersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  // 1. Obtener organización del usuario de forma resiliente
  const memberships = await getUserOrganizations(user.id, user.email);
  const [primaryMembership] = memberships;
  const orgId = primaryMembership?.org_id;
  const userRole = primaryMembership?.role;
  const isAdmin = userRole === "admin";
  const orgName = primaryMembership?.organization_name ?? "Mi Organización";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  let members: OrgMemberRow[] = [];
  let invitations: InvitationRow[] = [];
  const userMap = new Map<string, UserProfileMeta>();

  if (orgId) {
    // 2. Obtener miembros con sus perfiles mediante la función RPC SECURITY DEFINER
    const { data: memberProfiles, error: rpcErr } = await supabase.rpc(
      "get_org_member_profiles",
      { p_org_id: orgId }
    );

    if (!rpcErr && Array.isArray(memberProfiles)) {
      members = (
        memberProfiles as {
          auth_user_id: string;
          role: OrgMemberRole;
          email?: string;
          full_name?: string;
          job_title?: string;
        }[]
      ).map((p) => {
        userMap.set(p.auth_user_id, {
          email: p.email,
          full_name: p.full_name,
          job_title: p.job_title,
        });
        return {
          auth_user_id: p.auth_user_id,
          org_id: orgId,
          role: p.role,
        };
      });
    } else {
      // Fallback a consulta directa de org_members
      const { data: membersData, error: memError } = await db
        .from("org_members")
        .select("auth_user_id, org_id, role")
        .eq("org_id", orgId);

      if (memError) {
        console.error("[Dashboard Members] Error fetching members:", memError);
      }

      members = (membersData as OrgMemberRow[]) ?? [];

      userMap.set(user.id, {
        email: user.email,
        full_name: (user.user_metadata?.full_name as string) || undefined,
        job_title: (user.user_metadata?.job_title as string) || undefined,
      });
    }

    // 3. Obtener invitaciones pendientes
    const { data: invitationsData, error: invError } = await db
      .from("organization_invitations")
      .select("id, org_id, email, role, status, expires_at, created_at")
      .eq("org_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (invError) {
      console.error(
        "[Dashboard Members] Error fetching invitations:",
        invError
      );
    }

    invitations = (invitationsData as InvitationRow[]) ?? [];
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado y Acción Principal */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
              Miembros y Equipo
            </h1>
            <span className="text-xs text-[var(--muted)]">•</span>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink)] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              {orgName}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] sm:text-sm">
            Gestioná las invitaciones por Magic Link y roles de tu organización.
          </p>
        </div>

        {isAdmin && orgId && <InviteMemberModal orgId={orgId} />}
      </div>

      {/* Miembros Activos */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[var(--ink)]">
          Miembros Activos ({members.length})
        </h2>

        <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--muted)] uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Miembro / Usuario
                </th>
                <th scope="col" className="px-4 py-3">
                  Rol
                </th>
                <th scope="col" className="px-4 py-3">
                  Fecha de Ingreso
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-xs text-[var(--muted)]"
                  >
                    No hay miembros registrados en esta organización.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const isSelf = m.auth_user_id === user.id;
                  const profile = userMap.get(m.auth_user_id);
                  const displayName =
                    profile?.full_name ||
                    profile?.email ||
                    (isSelf
                      ? (user.email ?? "Tú")
                      : `Miembro (${m.auth_user_id.slice(0, 8)})`);
                  const displayEmail =
                    profile?.email || (isSelf ? user.email : undefined);
                  const avatarLetter = (displayName[0] || "?").toUpperCase();

                  return (
                    <tr
                      key={m.auth_user_id}
                      className="transition-colors hover:bg-[var(--background)]"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                            {avatarLetter}
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-xs font-semibold text-[var(--ink)] sm:text-sm">
                              {displayName}
                              {isSelf && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 font-sans text-xs font-semibold text-[var(--primary)]">
                                  Tú
                                </span>
                              )}
                            </span>
                            {displayEmail && profile?.full_name && (
                              <span className="truncate text-xs text-[var(--muted)]">
                                {displayEmail}
                              </span>
                            )}
                            {profile?.job_title && (
                              <span className="truncate text-xs text-[var(--muted)]">
                                {profile.job_title}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-semibold ${
                            m.role === "admin"
                              ? "border-[var(--urgent)]/30 bg-[var(--urgent)]/10 text-[var(--urgent)]"
                              : "border-[var(--standard)]/30 bg-[var(--standard)]/10 text-[var(--standard)]"
                          }`}
                        >
                          {m.role === "admin" ? "Administrador" : "Operador"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--muted)]">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Activo"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {isAdmin && orgId && (
                          <RemoveMemberButton
                            orgId={orgId}
                            memberAuthId={m.auth_user_id}
                            isSelf={isSelf}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invitaciones Pendientes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[var(--ink)]">
          Invitaciones Pendientes ({invitations.length})
        </h2>

        <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--muted)] uppercase">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Correo Destinatario
                </th>
                <th scope="col" className="px-4 py-3">
                  Rol Asignado
                </th>
                <th scope="col" className="px-4 py-3">
                  Expiración
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {invitations.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-[var(--muted)]"
                  >
                    No hay invitaciones pendientes. Podés invitar nuevos
                    colaboradores haciendo clic en &quot;+ Invitar
                    miembro&quot;.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-[var(--background)]"
                  >
                    <td className="px-4 py-3.5 font-medium text-[var(--ink)]">
                      {inv.email}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-xs font-semibold ${
                          inv.role === "admin"
                            ? "border-[var(--urgent)]/30 bg-[var(--urgent)]/10 text-[var(--urgent)]"
                            : "border-[var(--standard)]/30 bg-[var(--standard)]/10 text-[var(--standard)]"
                        }`}
                      >
                        {inv.role === "admin" ? "Administrador" : "Operador"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--muted)]">
                      {new Date(inv.expires_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-3">
                          <ResendInvitationButton invitationId={inv.id} />
                          <span className="text-[var(--border)]">•</span>
                          <RevokeInvitationButton invitationId={inv.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
