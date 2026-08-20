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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased">
      <div className="w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10">
        <div className="mb-8 text-center sm:text-left">
          <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
            Handly · Primer Ingreso
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            Completá tu perfil
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Para coordinar la recepción y distribución de donaciones de forma
            efectiva, necesitamos tus datos de contacto básicos.
          </p>
        </div>

        <OnboardingForm userEmail={user.email ?? ""} />
      </div>
    </main>
  );
}
