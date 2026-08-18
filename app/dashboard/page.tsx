import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Panel de organización</h1>
        <p style={styles.email}>
          Conectado como <strong>{user.email}</strong>
        </p>
        <form action={signOut}>
          <button type='submit' style={styles.button}>
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, sans-serif'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#111'
  },
  email: { margin: '0 0 24px', fontSize: '14px', color: '#555' },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#c0392b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
}
