"use server";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || typeof email !== "string") {
    redirect("/login?error=El+correo+electr%C3%B3nico+es+obligatorio");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const redirectUrl = `${env.siteUrl}/auth/callback`;

  try {
    const supabase = await createClient();

    // 1. Comprobar si el usuario posee una invitación pendiente en alguna organización
    const { data: pendingInvitations } = await supabase
      .from("organization_invitations")
      .select("id")
      .ilike("email", normalizedEmail)
      .eq("status", "pending")
      .limit(1);

    const isInvited = Boolean(
      pendingInvitations && pendingInvitations.length > 0
    );

    // 2. Despachar OTP:
    // Si NO está invitado previamente, shouldCreateUser: false REBOTA cualquier intento de auto-registro.
    // Solo si tiene una invitación pendiente se autoriza la creación de cuenta con shouldCreateUser: true.
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: isInvited,
      },
    });

    if (error) {
      console.error("[Auth Error] Supabase OTP error:", {
        message: error.message,
        status: error.status,
        name: error.name,
        email: normalizedEmail,
      });

      let userFriendlyMessage: string;
      const isSignupNotAllowed =
        error.message.toLowerCase().includes("signups not allowed") ||
        error.message.toLowerCase().includes("user not found") ||
        error.message.toLowerCase().includes("signup is disabled") ||
        error.status === 400;
      const isRateLimited =
        error.status === 429 || error.message.includes("rate limit");
      const isEmailSendError =
        error.message.includes("Error sending magic link email") ||
        error.name === "AuthRetryableFetchError" ||
        error.status === 500;

      if (isSignupNotAllowed) {
        userFriendlyMessage =
          "No existe ninguna cuenta asociada a este correo ni fuiste invitado a una organización. Contactá a tu administrador para recibir una invitación.";
      } else if (isEmailSendError) {
        userFriendlyMessage =
          "No se pudo enviar el correo de acceso. El servicio de correo de Supabase alcanzó su límite de envíos o requiere un proveedor SMTP configurado en el Dashboard.";
      } else if (isRateLimited) {
        userFriendlyMessage =
          "Demasiados intentos seguidos. Aguardá unos minutos antes de volver a solicitar un enlace.";
      } else {
        userFriendlyMessage = error.message;
      }

      redirect(`/login?error=${encodeURIComponent(userFriendlyMessage)}`);
    }
  } catch (error: unknown) {
    const isRedirect =
      error !== null &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");
    if (isRedirect) {
      throw error;
    }

    console.error(
      "[Auth Critical Error] Unexpected failure sending magic link:",
      {
        error: error instanceof Error ? error.stack || error.message : error,
        email: normalizedEmail,
      }
    );
    redirect("/login?error=Error+interno+al+procesar+el+acceso");
  }

  redirect("/login/check-email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
