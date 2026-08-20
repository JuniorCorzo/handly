import { createAdminClient, createClient } from "@/lib/supabase/server";

export interface UserOrganizationMembership {
  org_id: string;
  role: string;
  organization_name: string;
}

/**
 * Obtiene de forma resiliente las organizaciones a las que pertenece el usuario.
 * Si el usuario es el dueño de la organización (su email coincide con organizations.email)
 * o tiene invitaciones pendientes, lo auto-vincula en org_members.
 */
export async function getUserOrganizations(
  userId: string,
  userEmail?: string | null
): Promise<UserOrganizationMembership[]> {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  // 1. Consultar membresías existentes
  const { data: existingMemberships } = await db
    .from("org_members")
    .select("org_id, role, organizations(name)")
    .eq("auth_user_id", userId);

  if (existingMemberships && existingMemberships.length > 0) {
    return existingMemberships.map((m) => {
      const orgObj = m.organizations as unknown;
      const orgName =
        (Array.isArray(orgObj)
          ? (orgObj[0] as { name?: string })?.name
          : (orgObj as { name?: string } | null)?.name) ?? "Mi Organización";
      return {
        org_id: m.org_id,
        role: m.role,
        organization_name: orgName,
      };
    });
  }

  // 2. Auto-vinculación si no tiene membresías pero tiene email
  if (userEmail) {
    const normalizedEmail = userEmail.trim().toLowerCase();

    // 2.1 Buscar si su email coincide con el email de una organización registrada
    const { data: matchedOrgs } = await db
      .from("organizations")
      .select("id, name")
      .ilike("email", normalizedEmail);

    if (matchedOrgs && matchedOrgs.length > 0) {
      await Promise.all(
        matchedOrgs.map(async (org) => {
          await db.from("org_members").upsert(
            {
              auth_user_id: userId,
              org_id: org.id,
              role: "admin",
            },
            { onConflict: "auth_user_id,org_id" }
          );
        })
      );

      return matchedOrgs.map((org) => ({
        org_id: org.id,
        role: "admin",
        organization_name: org.name,
      }));
    }

    // 2.2 Buscar si tiene invitaciones pendientes para este correo
    const { data: pendingInvitations } = await db
      .from("organization_invitations")
      .select("id, org_id, role, organizations(name)")
      .ilike("email", normalizedEmail)
      .eq("status", "pending");

    if (pendingInvitations && pendingInvitations.length > 0) {
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

          const orgObj = inv.organizations as unknown;
          const orgName =
            (Array.isArray(orgObj)
              ? (orgObj[0] as { name?: string })?.name
              : (orgObj as { name?: string } | null)?.name) ??
            "Mi Organización";

          return {
            org_id: inv.org_id,
            role: inv.role,
            organization_name: orgName,
          };
        })
      );

      return linked;
    }
  }

  return [];
}
