import { signInWithMagicLink } from '@/app/actions/auth'

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export const instant = false

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Triage SOS</h1>
        <p style={styles.subtitle}>Panel de organizaciones</p>

        <form action={signInWithMagicLink} style={styles.form}>
          <label htmlFor='email' style={styles.label}>
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            placeholder='org@ejemplo.com'
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type='submit' style={styles.button}>
            Enviar enlace de acceso
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
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#111'
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '14px',
    color: '#666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px 14px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  },
  error: {
    margin: '0',
    fontSize: '13px',
    color: '#c0392b',
    backgroundColor: '#fdf0ef',
    padding: '8px 12px',
    borderRadius: '6px'
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#111',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
}
