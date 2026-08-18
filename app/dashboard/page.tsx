import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export const instant = false

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className='flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 font-sans text-[var(--ink)] antialiased'>
      <div className='w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[0_1px_3px_oklch(0.23_0.02_173/0.08)] sm:p-10'>
        <div className='mb-6'>
          <span className='inline-block text-xs font-semibold tracking-wider text-[var(--primary)] uppercase'>
            Handly
          </span>
          <h1 className='mt-1 text-2xl font-bold tracking-tight text-[var(--ink)]'>
            Panel de Organización
          </h1>
          <p className='mt-2 text-sm text-[var(--muted)]'>
            Conectado como{' '}
            <strong className='font-medium text-[var(--ink)]'>
              {user.email}
            </strong>
          </p>
        </div>

        <div className='my-6 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-4 text-xs text-[var(--muted)]'>
          <p className='font-medium text-[var(--ink)]'>Estado de la sesión</p>
          <p className='mt-1'>
            Autenticado mediante Magic Link (Supabase Auth).
          </p>
        </div>

        <form action={signOut}>
          <button
            type='submit'
            className='inline-flex w-full items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] shadow-xs transition-all hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]'
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  )
}
