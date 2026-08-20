"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  OnboardingSchema,
  MemberErrorCode,
  getMemberErrorMessage,
} from "@/lib/validations/member";

export interface OnboardingActionState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function completeOnboardingAction(
  _prevState: OnboardingActionState | null,
  formData: FormData
): Promise<OnboardingActionState> {
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
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    job_title: formData.get("job_title") || "",
    organization_name: formData.get("organization_name") || "",
    organization_phone: formData.get("organization_phone") || "",
    zone_code: formData.get("zone_code") || "",
  };

  const parsed = OnboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMap = z.flattenError(parsed.error);
    return {
      success: false,
      error: "Por favor completá los campos obligatorios correctamente.",
      fieldErrors: errorMap.fieldErrors as Record<string, string[]>,
    };
  }

  const {
    full_name,
    phone,
    job_title,
    organization_name,
    organization_phone,
    zone_code,
  } = parsed.data;

  try {
    const normalizedEmail = user.email?.trim().toLowerCase() ?? "";

    // 1. Verificar si el usuario ya tiene membresía o invitaciones pendientes
    const [{ data: memberships }, { data: pendingInvitations }] =
      await Promise.all([
        supabase
          .from("org_members")
          .select("org_id, role")
          .eq("auth_user_id", user.id),
        normalizedEmail
          ? supabase
              .from("organization_invitations")
              .select("id, org_id, role")
              .ilike("email", normalizedEmail)
              .eq("status", "pending")
          : Promise.resolve({ data: [] }),
      ]);

    // Caso A: Si tiene invitaciones pendientes, aceptarlas y vincular
    if (pendingInvitations && pendingInvitations.length > 0) {
      await Promise.all(
        pendingInvitations.map(async (inv) => {
          await Promise.all([
            supabase.from("org_members").upsert(
              {
                auth_user_id: user.id,
                org_id: inv.org_id,
                role: inv.role,
              },
              { onConflict: "auth_user_id,org_id" }
            ),
            supabase
              .from("organization_invitations")
              .update({ status: "accepted" })
              .eq("id", inv.id),
          ]);
        })
      );
    } else if (!memberships || memberships.length === 0) {
      // Caso B: No tiene membresía ni invitación -> Debe crear una organización
      const orgName = organization_name.trim();
      if (!orgName) {
        return {
          success: false,
          error: "Debés ingresar el nombre de tu organización para continuar.",
          fieldErrors: {
            organization_name: [
              getMemberErrorMessage(MemberErrorCode.ORG_NAME_REQUIRED),
            ],
          },
        };
      }

      const orgPhone = organization_phone.trim() || phone.trim();
      if (!orgPhone) {
        return {
          success: false,
          error: "Debés ingresar el teléfono institucional de tu organización.",
          fieldErrors: {
            organization_phone: [
              getMemberErrorMessage(MemberErrorCode.ORG_PHONE_REQUIRED),
            ],
          },
        };
      }

      // Crear la organización de forma atómica con la función RPC
      const { error: rpcErr } = await supabase.rpc(
        "create_organization_with_admin",
        {
          p_name: orgName,
          p_phone: orgPhone,
          p_zone_code: zone_code.trim() || null,
        }
      );

      if (rpcErr) {
        // Fallback a inserción directa si la función RPC no está disponible
        const { data: newOrg, error: createOrgErr } = await supabase
          .from("organizations")
          .insert({
            name: orgName,
            phone: orgPhone,
            zone_code: zone_code.trim() || null,
          })
          .select("id")
          .single();

        if (createOrgErr || !newOrg) {
          console.error(
            "[Onboarding] Error creating organization (direct insert):",
            createOrgErr
          );
          return {
            success: false,
            error:
              "No se pudo crear la organización. Verificá los permisos de tu base de datos.",
          };
        }

        // Asignar al usuario creador como admin en org_members
        const { error: assignAdminErr } = await supabase
          .from("org_members")
          .insert({
            auth_user_id: user.id,
            org_id: newOrg.id,
            role: "admin",
          });

        if (assignAdminErr) {
          console.error(
            "[Onboarding] Error assigning admin in org_members:",
            assignAdminErr
          );
          return {
            success: false,
            error:
              "Se creó la organización pero falló la asignación de permisos.",
          };
        }
      }
    }

    // 2. Actualizar metadata del usuario en Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name,
        phone,
        job_title,
        onboarding_completed: true,
      },
    });

    if (updateError) {
      console.error("[Onboarding] Error updating user metadata:", updateError);
      return {
        success: false,
        error:
          "No se pudieron guardar tus datos de perfil. Intentá nuevamente.",
      };
    }
  } catch (error) {
    console.error("[Onboarding] Unexpected error:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado al completar tu perfil.",
    };
  }

  redirect("/dashboard");
}
