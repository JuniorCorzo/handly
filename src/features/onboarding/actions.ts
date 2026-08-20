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
  const rawData = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    job_title: formData.get("job_title") || "",
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

  const { full_name, phone, job_title } = parsed.data;

  try {
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
