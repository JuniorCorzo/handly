"use server";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || typeof email !== "string") {
    redirect("/login?error=Email+is+required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const redirectUrl = `${env.siteUrl}/auth/callback`;

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectUrl,
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
      const isRateLimited =
        error.status === 429 || error.message.includes("rate limit");
      const isEmailSendError =
        error.message.includes("Error sending magic link email") ||
        error.name === "AuthRetryableFetchError" ||
        error.status === 500;

      if (isEmailSendError) {
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
    redirect("/login?error=Internal+server+error+sending+email");
  }

  redirect("/login/check-email");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
