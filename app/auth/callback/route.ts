import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] Exchange code error:", error);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const normalizedEmail = user.email.trim().toLowerCase();
    const adminClient = createAdminClient();
    const db = adminClient ?? supabase;

    // 1. Vincular invitaciones pendientes para este email (usando admin client para evitar bloqueo RLS)
    const { data: pendingInvitations, error: fetchErr } = await db
      .from("organization_invitations")
      .select("id, org_id, role")
      .eq("email", normalizedEmail)
      .eq("status", "pending");

    if (fetchErr) {
      console.error(
        "[Auth Callback] Fetch pending invitations error:",
        fetchErr
      );
    }

    if (pendingInvitations && pendingInvitations.length > 0) {
      await Promise.all(
        pendingInvitations.map(async (inv) => {
          const { error: upsertErr } = await db.from("org_members").upsert(
            {
              auth_user_id: user.id,
              org_id: inv.org_id,
              role: inv.role,
            },
            { onConflict: "auth_user_id,org_id" }
          );

          if (upsertErr) {
            console.error(
              "[Auth Callback] Upsert org_members error:",
              upsertErr
            );
          }

          const { error: updateErr } = await db
            .from("organization_invitations")
            .update({ status: "accepted" })
            .eq("id", inv.id);

          if (updateErr) {
            console.error(
              "[Auth Callback] Update invitation error:",
              updateErr
            );
          }
        })
      );
    }

    // 2. Redirigir a onboarding si es primer acceso
    const hasCompletedOnboarding = Boolean(
      user.user_metadata?.onboarding_completed
    );

    if (!hasCompletedOnboarding) {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
