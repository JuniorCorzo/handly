import Link from 'next/link'

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--ink)] antialiased'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]'>
        <div className='mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6'>
          <Link href='/' className='flex items-center gap-2'>
            <span className='text-xl font-bold tracking-tight text-[var(--ink)]'>
              Handly
            </span>
          </Link>
          <nav className='flex items-center gap-4'>
            <Link
              href='/login'
              className='inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--surface)] shadow-xs transition-all hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]'
            >
              Acceso Organizaciones
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className='flex-1'>
        <section className='mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24'>
          <div className='max-w-2xl'>
            <span className='inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--primary)]'>
              <span className='h-2 w-2 rounded-full bg-[var(--success)]' />
              Coordinación Operativa de Emergencias
            </span>
            <h1 className='mt-6 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl lg:text-5xl lg:leading-tight'>
              Respuesta rápida y directa para donaciones en emergencias.
            </h1>
            <p className='mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg'>
              Handly conecta necesidades urgentes verificadas por organizaciones
              en el territorio con personas dispuestas a donar insumos clave.
              Sin intermediarios ruidosos, con claridad operativa.
            </p>
            <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:items-center'>
              <Link
                href='/login'
                className='inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--surface)] shadow-xs transition-all hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--focus)]'
              >
                Ingresar como Organización
              </Link>
              <a
                href='#como-funciona'
                className='inline-flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--ink)] shadow-xs transition-all hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]'
              >
                Conocer cómo funciona
              </a>
            </div>
          </div>
        </section>

        {/* Pilares / Cómo funciona */}
        <section
          id='como-funciona'
          className='border-t border-[var(--border)] bg-[var(--surface)] py-16 sm:py-20'
        >
          <div className='mx-auto max-w-5xl px-4 sm:px-6'>
            <div className='max-w-xl'>
              <h2 className='text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl'>
                Diseñado para la calma en momentos de presión.
              </h2>
              <p className='mt-2 text-sm text-[var(--muted)] sm:text-base'>
                Priorizamos la información crítica y la facilidad de uso desde
                cualquier dispositivo en el lugar de los hechos.
              </p>
            </div>

            <div className='mt-12 grid gap-6 sm:grid-cols-3'>
              {/* Feature 1 */}
              <div className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6'>
                <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm'>
                  01
                </div>
                <h3 className='text-lg font-semibold text-[var(--ink)]'>
                  Peticiones en tiempo real
                </h3>
                <p className='mt-2 text-sm text-[var(--muted)] leading-relaxed'>
                  Las organizaciones publican listados concretos de insumos
                  faltantes en zonas afectadas, con priorización transparente.
                </p>
              </div>

              {/* Feature 2 */}
              <div className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6'>
                <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm'>
                  02
                </div>
                <h3 className='text-lg font-semibold text-[var(--ink)]'>
                  Compromiso Donor-First
                </h3>
                <p className='mt-2 text-sm text-[var(--muted)] leading-relaxed'>
                  Los donantes aseguran el aporte de elementos específicos en 1
                  click sin formularios largos ni intermediación monetaria.
                </p>
              </div>

              {/* Feature 3 */}
              <div className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6'>
                <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm'>
                  03
                </div>
                <h3 className='text-lg font-semibold text-[var(--ink)]'>
                  Trazabilidad SOS
                </h3>
                <p className='mt-2 text-sm text-[var(--muted)] leading-relaxed'>
                  Cada compromiso genera un identificador único que garantiza la
                  llegada coordinada al punto de recepción.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ejemplo de Necesidad Activa */}
        <section className='mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20'>
          <div className='rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-8'>
            <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4'>
              <div>
                <span className='inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--critical)] px-2.5 py-0.5 text-xs font-semibold text-[var(--surface)]'>
                  Urgencia Crítica
                </span>
                <h3 className='mt-2 text-xl font-bold text-[var(--ink)]'>
                  Kits de Primeros Auxilios e Insumos Médicos
                </h3>
              </div>
              <span className='font-mono text-xs font-medium text-[var(--muted)] bg-[var(--background)] px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--border)]'>
                SOS-8402
              </span>
            </div>

            <div className='mt-4 grid gap-4 sm:grid-cols-3'>
              <div>
                <span className='text-xs text-[var(--muted)] uppercase tracking-wider font-semibold'>
                  Requerido
                </span>
                <p className='text-base font-semibold text-[var(--ink)]'>
                  150 Unidades
                </p>
              </div>
              <div>
                <span className='text-xs text-[var(--muted)] uppercase tracking-wider font-semibold'>
                  Zona de Recepción
                </span>
                <p className='text-base font-semibold text-[var(--ink)]'>
                  Centro Operativo Norte
                </p>
              </div>
              <div>
                <span className='text-xs text-[var(--muted)] uppercase tracking-wider font-semibold'>
                  Estado
                </span>
                <p className='text-base font-semibold text-[var(--success)]'>
                  65% Cubierto
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-[var(--border)] bg-[var(--surface)] py-8 text-xs text-[var(--muted)]'>
        <div className='mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6'>
          <div className='flex items-center gap-2'>
            <span className='font-bold text-[var(--ink)]'>Handly</span>
            <span>· Coordinación de Donaciones</span>
          </div>
          <p>© 2026 Handly. Operativa serena en emergencias.</p>
        </div>
      </footer>
    </div>
  )
}
