import { redirect } from "next/navigation";

import { OnboardingForm } from "@/features/onboarding/components/OnboardingForm";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hasCompletedOnboarding = Boolean(
    user.user_metadata?.onboarding_completed
  );
  if (hasCompletedOnboarding) {
    redirect("/dashboard");
  }

  const normalizedEmail = user.email?.trim().toLowerCase() ?? "";

  // Consultar si viene por invitación o membresía existente
  let invitationOrgName: string | null = null;

  if (normalizedEmail) {
    const { data: pendingInvitations } = await supabase
      .from("organization_invitations")
      .select("org_id, organizations(name)")
      .ilike("email", normalizedEmail)
      .eq("status", "pending")
      .limit(1);

    const firstInv = pendingInvitations?.[0];
    if (firstInv) {
      const orgObj = firstInv.organizations as unknown;
      invitationOrgName =
        (Array.isArray(orgObj)
          ? (orgObj[0] as { name?: string })?.name
          : (orgObj as { name?: string } | null)?.name) ?? "la organización";
    }
  }

  const { data: existingMemberships } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("auth_user_id", user.id)
    .limit(1);

  const hasExistingOrg =
    Boolean(invitationOrgName) ||
    Boolean(existingMemberships && existingMemberships.length > 0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased">
      <div className="w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10">
        <div className="mb-8 text-center sm:text-left">
          <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
            Handly · Primer Ingreso
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            {hasExistingOrg ? "Completá tu perfil" : "Registrá tu Organización"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {hasExistingOrg
              ? "Para coordinar la recepción y distribución de donaciones de forma efectiva, necesitamos tus datos de contacto."
              : "Ingresá tus datos personales y la información básica de tu organización para comenzar a coordinar donaciones."}
          </p>
        </div>

        <OnboardingForm
          userEmail={user.email ?? ""}
          invitationOrgName={invitationOrgName}
          isOrgCreator={!hasExistingOrg}
        />
      </div>
    </main>
  );
}
