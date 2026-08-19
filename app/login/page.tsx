import { signInWithMagicLink } from "@/features/auth/actions";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export const instant = false;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

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

        <form action={signInWithMagicLink} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[var(--ink)]"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="organizacion@ejemplo.org"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--ink)] transition-colors placeholder:[color:var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus)] focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--critical)]/20 bg-[var(--critical)]/10 px-3.5 py-2.5 text-sm text-[var(--critical)]">
              <svg
                className="h-4 w-4 shrink-0 fill-current"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--surface)] shadow-xs transition-all hover:bg-[var(--primary)]/90 focus:ring-2 focus:ring-[var(--focus)] focus:ring-offset-2 focus:outline-none active:scale-[0.98] disabled:opacity-50"
          >
            Enviar enlace de acceso
          </button>
        </form>
      </div>
    </main>
  );
}
