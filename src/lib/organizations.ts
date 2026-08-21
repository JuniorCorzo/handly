import { createAdminClient, createClient } from "@/lib/supabase/server";

export interface UserOrganizationMembership {
  org_id: string;
  role: string;
  organization_name: string;
}

/**
 * Obtiene las organizaciones del usuario autenticado a través de sus membresías en org_members.
 * 1. Consulta org_members por auth_user_id.
 * 2. Si no tiene filas directas, verifica si tiene invitaciones pendientes en organization_invitations.
 */
export async function getUserOrganizations(
  userId: string,
  userEmail?: string | null
): Promise<UserOrganizationMembership[]> {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  // 1. Consultar membresías directas en org_members
  const { data: directMemberships, error: memErr } = await db
    .from("org_members")
    .select("org_id, role")
    .eq("auth_user_id", userId);

  if (memErr) {
    console.error(
      "[getUserOrganizations] Error querying org_members for user",
      userId,
      memErr
    );
  }

  if (directMemberships && directMemberships.length > 0) {
    const orgIds = directMemberships.map((m) => m.org_id);
    const { data: orgs, error: orgErr } = await db
      .from("organizations")
      .select("id, name")
      .in("id", orgIds);

    if (orgErr) {
      console.error(
        "[getUserOrganizations] Error querying organizations:",
        orgErr
      );
    }

    const orgMap = new Map(orgs?.map((o) => [o.id, o.name]));
    return directMemberships.map((m) => ({
      org_id: m.org_id,
      role: m.role,
      organization_name: orgMap.get(m.org_id) || "Mi Organización",
    }));
  }

  // 2. Si no hay membresías en org_members, verificar si tiene invitaciones pendientes por email
  if (userEmail) {
    const normalizedEmail = userEmail.trim().toLowerCase();

    const { data: pendingInvitations, error: invErr } = await db
      .from("organization_invitations")
      .select("id, org_id, role")
      .ilike("email", normalizedEmail)
      .eq("status", "pending");

    if (invErr) {
      console.error(
        "[getUserOrganizations] Error querying pending invitations:",
        invErr
      );
    }

    if (pendingInvitations && pendingInvitations.length > 0) {
      const orgIds = pendingInvitations.map((i) => i.org_id);
      const { data: invOrgs } = await db
        .from("organizations")
        .select("id, name")
        .in("id", orgIds);

      const invOrgMap = new Map(invOrgs?.map((o) => [o.id, o.name]));

      const linked = await Promise.all(
        pendingInvitations.map(async (inv) => {
          await Promise.all([
            db.from("org_members").upsert(
              {
                auth_user_id: userId,
                org_id: inv.org_id,
                role: inv.role,
              },
              { onConflict: "auth_user_id,org_id" }
            ),
            db
              .from("organization_invitations")
              .update({ status: "accepted" })
              .eq("id", inv.id),
          ]);

          return {
            org_id: inv.org_id,
            role: inv.role,
            organization_name: invOrgMap.get(inv.org_id) || "Mi Organización",
          };
        })
      );

      return linked;
    }
  }

  return [];
}
