"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { env } from "@/lib/env";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  InviteMemberSchema,
  MemberErrorCode,
  getMemberErrorMessage,
} from "@/lib/validations/member";

const MEMBERS_PATH = "/dashboard/members";
const DASHBOARD_PATH = "/dashboard";

export interface MemberActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function inviteMemberAction(
  _prevState: MemberActionState | null,
  formData: FormData
): Promise<MemberActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
    };
  }

  const rawData = {
    org_id: formData.get("org_id"),
    email: formData.get("email"),
    role: formData.get("role"),
  };

  const parsed = InviteMemberSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMap = z.flattenError(parsed.error);
    return {
      success: false,
      error: "Datos inválidos en la invitación.",
      fieldErrors: errorMap.fieldErrors as Record<string, string[]>,
    };
  }

  const { org_id, email, role } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. Verificar que el usuario actual sea admin de la organización
    const { data: adminMembership } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", org_id)
      .eq("auth_user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminMembership) {
      return {
        success: false,
        error:
          "Solo los administradores de la organización pueden enviar invitaciones.",
      };
    }

    // 2. Comprobar si ya existe una invitación pendiente para este correo
    const { data: existingInvite } = await supabase
      .from("organization_invitations")
      .select("id")
      .eq("org_id", org_id)
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return {
        success: false,
        error: getMemberErrorMessage(MemberErrorCode.INVITATION_EXISTS),
      };
    }

    // 3. Crear registro de invitación
    const { error: inviteError } = await supabase
      .from("organization_invitations")
      .insert({
        org_id,
        email: normalizedEmail,
        role,
        invited_by: user.id,
        status: "pending",
      });

    if (inviteError) {
      console.error("[Invite Member] DB insert error:", inviteError);
      return {
        success: false,
        error: "Error al registrar la invitación en la base de datos.",
      };
    }

    // 4. Enviar correo usando la plantilla oficial de Invitación de Supabase
    const redirectUrl = `${env.siteUrl}/auth/callback`;
    const adminClient = createAdminClient();

    let mailError: { message: string } | null = null;

    if (adminClient) {
      // Dispara la plantilla oficial "Invite user" de Supabase
      const { error: adminInviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
          redirectTo: redirectUrl,
          data: {
            org_id,
            role,
          },
        });

      if (adminInviteErr) {
        // Si el usuario ya existe en auth.users (por invitación previa no confirmada),
        // buscamos si aún no confirmó su email para regenerar la invitación oficial:
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existingAuthUser = usersData?.users.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );

        if (existingAuthUser && !existingAuthUser.email_confirmed_at) {
          await adminClient.auth.admin.deleteUser(existingAuthUser.id);
          const { error: retryErr } =
            await adminClient.auth.admin.inviteUserByEmail(normalizedEmail, {
              redirectTo: redirectUrl,
              data: {
                org_id,
                role,
              },
            });
          mailError = retryErr;
        } else {
          // Si el usuario ya está activo/confirmado, enviamos OTP de acceso
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: normalizedEmail,
            options: {
              emailRedirectTo: redirectUrl,
            },
          });
          mailError = otpError;
        }
      }
    } else {
      // Fallback a OTP Magic Link si no está configurada la admin key
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      mailError = otpError;
    }

    if (mailError) {
      console.error("[Invite Member] Supabase mail send error:", mailError);
      return {
        success: true,
        error:
          "Invitación registrada en la base de datos, pero hubo un problema despachando el correo de Supabase. Podés reenviarla desde la lista.",
      };
    }

    revalidatePath(MEMBERS_PATH);
    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error("[Invite Member] Unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar la invitación.",
    };
  }
}

export async function resendInvitationAction(
  invitationId: string
): Promise<MemberActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
    };
  }

  try {
    // 1. Obtener datos de la invitación
    const { data: invite, error: fetchError } = await supabase
      .from("organization_invitations")
      .select("id, org_id, email, role, status")
      .eq("id", invitationId)
      .single();

    if (fetchError || !invite) {
      return {
        success: false,
        error: getMemberErrorMessage(MemberErrorCode.INVITATION_NOT_FOUND),
      };
    }

    // 2. Verificar permisos de admin en la organización
    const { data: adminMembership } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", invite.org_id)
      .eq("auth_user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminMembership) {
      return {
        success: false,
        error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
      };
    }

    // 3. Renovar fecha de expiración y resetear status si era expired
    const newExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    await supabase
      .from("organization_invitations")
      .update({
        status: "pending",
        expires_at: newExpiresAt,
      })
      .eq("id", invitationId);

    // 4. Despachar correo de invitación oficial de Supabase
    const redirectUrl = `${env.siteUrl}/auth/callback`;
    const adminClient = createAdminClient();

    let mailError: { message: string } | null = null;

    if (adminClient) {
      const { error: adminInviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(invite.email, {
          redirectTo: redirectUrl,
          data: {
            org_id: invite.org_id,
            role: invite.role,
          },
        });

      // Si el usuario ya fue creado en auth.users en la primera invitación,
      // buscamos si aún no confirmó su correo para re-crearlo y forzar el template de invitación oficial:
      if (adminInviteErr) {
        const normalizedInviteEmail = invite.email.trim().toLowerCase();
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const existingAuthUser = usersData?.users.find(
          (u) => u.email?.toLowerCase() === normalizedInviteEmail
        );

        if (existingAuthUser && !existingAuthUser.email_confirmed_at) {
          await adminClient.auth.admin.deleteUser(existingAuthUser.id);
          const { error: retryErr } =
            await adminClient.auth.admin.inviteUserByEmail(invite.email, {
              redirectTo: redirectUrl,
              data: {
                org_id: invite.org_id,
                role: invite.role,
              },
            });
          mailError = retryErr;
        } else {
          // Si el usuario ya está activo/confirmado, enviamos OTP de acceso
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: invite.email,
            options: {
              emailRedirectTo: redirectUrl,
            },
          });
          mailError = otpError;
        }
      }
    } else {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: invite.email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      mailError = otpError;
    }

    if (mailError) {
      console.error("[Resend Invite] Supabase mail send error:", mailError);
      return {
        success: false,
        error:
          "No se pudo despachar el correo de invitación. Verificá los límites de Supabase o la configuración SMTP.",
      };
    }

    revalidatePath(MEMBERS_PATH);
    return { success: true };
  } catch (error) {
    console.error("[Resend Invite] Unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado al reenviar la invitación.",
    };
  }
}

export async function revokeInvitationAction(
  invitationId: string
): Promise<MemberActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
    };
  }

  try {
    const { data: invite } = await supabase
      .from("organization_invitations")
      .select("org_id")
      .eq("id", invitationId)
      .single();

    if (!invite) {
      return {
        success: false,
        error: getMemberErrorMessage(MemberErrorCode.INVITATION_NOT_FOUND),
      };
    }

    const { data: adminMembership } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", invite.org_id)
      .eq("auth_user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminMembership) {
      return {
        success: false,
        error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
      };
    }

    const { error: deleteError } = await supabase
      .from("organization_invitations")
      .update({ status: "revoked" })
      .eq("id", invitationId);

    if (deleteError) {
      return {
        success: false,
        error: "No se pudo cancelar la invitación.",
      };
    }

    revalidatePath(MEMBERS_PATH);
    return { success: true };
  } catch (error) {
    console.error("[Revoke Invite] Unexpected error:", error);
    return {
      success: false,
      error: "Error inesperado al revocar la invitación.",
    };
  }
}

export async function removeMemberAction(
  orgId: string,
  targetAuthUserId: string
): Promise<MemberActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
    };
  }

  try {
    // Verificar que el solicitante sea admin
    const { data: adminMembership } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("auth_user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminMembership) {
      return {
        success: false,
        error: getMemberErrorMessage(MemberErrorCode.UNAUTHORIZED),
      };
    }

    // Si intenta eliminarse a sí mismo, verificar que haya otro admin
    if (user.id === targetAuthUserId) {
      const { data: otherAdmins } = await supabase
        .from("org_members")
        .select("auth_user_id")
        .eq("org_id", orgId)
        .eq("role", "admin")
        .neq("auth_user_id", user.id);

      if (!otherAdmins || otherAdmins.length === 0) {
        return {
          success: false,
          error:
            "No podés removerte siendo el único administrador de la organización.",
        };
      }
    }

    const { error } = await supabase
      .from("org_members")
      .delete()
      .eq("org_id", orgId)
      .eq("auth_user_id", targetAuthUserId);

    if (error) {
      console.error("[Remove Member] DB delete error:", error);
      return {
        success: false,
        error: "Error al eliminar al miembro de la organización.",
      };
    }

    revalidatePath(MEMBERS_PATH);
    revalidatePath(DASHBOARD_PATH);
    return { success: true };
  } catch (error) {
    console.error("[Remove Member] Unexpected error:", error);
    return {
      success: false,
      error: "Error inesperado al remover el miembro.",
    };
  }
}
