export default function CheckEmailPage() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased'>
      <div className='w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10'>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--primary)]/10 text-[var(--primary)]'>
          <svg
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
            />
          </svg>
        </div>
        <span className='inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase'>
          Handly
        </span>
        <h1 className='mt-1 text-2xl font-bold tracking-tight text-[var(--ink)]'>
          Revisá tu email
        </h1>
        <p className='mt-3 text-sm leading-relaxed text-[var(--muted)]'>
          Te enviamos un enlace de acceso seguro. Hacé click en él para ingresar
          al panel de Handly.
        </p>
        <p className='mt-4 text-xs text-[var(--muted)] opacity-80'>
          Si no lo ves en unos minutos, revisá la carpeta de correo no deseado
          (spam).
        </p>
      </div>
    </main>
  )
}
