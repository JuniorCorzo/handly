import { LoginForm } from "@/features/auth/components/LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export const instant = false;

function getErrorMessage(error?: string): string | undefined {
  if (!error) {
    return undefined;
  }
  if (error === "missing_code") {
    return "El enlace de acceso es inválido o ya fue utilizado. Por favor solicitá uno nuevo.";
  }
  if (error === "auth_failed") {
    return "No se pudo validar la sesión. El enlace expiró o fue revocado.";
  }
  return error;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const friendlyError = getErrorMessage(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased">
      <div className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10">
        <div className="mb-8 text-center sm:text-left">
          <span className="inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
            Handly
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
            Acceso a Organizaciones
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Handly · Ingresá tu email corporativo para recibir el enlace de
            acceso.
          </p>
        </div>

        <LoginForm initialError={friendlyError} />
      </div>
    </main>
  );
}
