import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

async function processUserPostAuth(
  userEmail: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const adminClient = createAdminClient();
  const db = adminClient ?? supabase;

  // Vincular invitaciones pendientes para este email
  const { data: pendingInvitations, error: fetchErr } = await db
    .from("organization_invitations")
    .select("id, org_id, role")
    .eq("email", normalizedEmail)
    .eq("status", "pending");

  if (fetchErr) {
    console.error("[Auth Callback] Fetch pending invitations error:", fetchErr);
  }

  if (pendingInvitations && pendingInvitations.length > 0) {
    await Promise.all(
      pendingInvitations.map(async (inv) => {
        const { error: upsertErr } = await db.from("org_members").upsert(
          {
            auth_user_id: userId,
            org_id: inv.org_id,
            role: inv.role,
          },
          { onConflict: "auth_user_id,org_id" }
        );

        if (upsertErr) {
          console.error("[Auth Callback] Upsert org_members error:", upsertErr);
        }

        const { error: updateErr } = await db
          .from("organization_invitations")
          .update({ status: "accepted" })
          .eq("id", inv.id);

        if (updateErr) {
          console.error("[Auth Callback] Update invitation error:", updateErr);
        }
      })
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  // 1. Flujo PKCE en query params (?code=...)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[Auth Callback] Exchange code error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }
  // 2. Flujo OTP token_hash en query params (?token_hash=...&type=...)
  else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      console.error("[Auth Callback] Verify OTP error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  }
  // 3. Flujo Fragmento Hash en cliente (#access_token=... o sesión ya activa)
  else {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Retornamos una página puente ultra-ligera que extrae el hash del navegador (window.location.hash)
      // generado por invitaciones o links implícitos de Supabase y lo envía vía POST a este mismo endpoint.
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verificando acceso · Handly</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0c0a09; color: #fafaf9; }
    .card { text-align: center; padding: 24px; }
    .spinner { width: 32px; height: 32px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #22c55e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <p style="font-size: 14px; font-weight: 500; opacity: 0.9;">Accediendo a Handly...</p>
  </div>
  <script>
    (async function() {
      try {
        var hash = window.location.hash.substring(1);
        if (!hash) {
          window.location.replace('/login?error=' + encodeURIComponent('El enlace es inválido o ya fue utilizado. Por favor solicitá uno nuevo.'));
          return;
        }
        var params = new URLSearchParams(hash);
        var accessToken = params.get('access_token');
        var refreshToken = params.get('refresh_token');
        var errorDesc = params.get('error_description') || params.get('error');

        if (errorDesc) {
          window.location.replace('/login?error=' + encodeURIComponent(errorDesc));
          return;
        }

        if (accessToken && refreshToken) {
          var res = await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken })
          });
          var data = await res.json();
          if (data && data.redirect) {
            window.location.replace(data.redirect);
          } else {
            window.location.replace('/dashboard');
          }
        } else {
          window.location.replace('/login?error=' + encodeURIComponent('El enlace es inválido o ya fue utilizado. Por favor solicitá uno nuevo.'));
        }
      } catch (e) {
        window.location.replace('/login?error=auth_failed');
      }
    })();
  </script>
</body>
</html>`;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    await processUserPostAuth(user.email, user.id, supabase);

    const hasCompletedOnboarding = Boolean(
      user.user_metadata?.onboarding_completed
    );

    if (!hasCompletedOnboarding) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Tokens de sesión requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: sessionData, error: sessionErr } =
      await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

    if (sessionErr || !sessionData.user) {
      console.error("[Auth Callback POST] setSession error:", sessionErr);
      return NextResponse.json(
        { error: "No se pudo establecer la sesión" },
        { status: 401 }
      );
    }

    const { user } = sessionData;
    if (user.email) {
      await processUserPostAuth(user.email, user.id, supabase);
    }

    const hasCompletedOnboarding = Boolean(
      user.user_metadata?.onboarding_completed
    );
    const redirect = hasCompletedOnboarding ? "/dashboard" : "/onboarding";

    return NextResponse.json({ success: true, redirect });
  } catch (error) {
    console.error("[Auth Callback POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
