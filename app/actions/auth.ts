'use server'

import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { redirect } from 'next/navigation'

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || typeof email !== 'string') {
    console.warn('[Auth Warning] signInWithMagicLink called without email')
    redirect('/login?error=Email+is+required')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const redirectUrl = `${env.siteUrl}/auth/callback`

  console.log('[Auth Info] Requesting Magic Link OTP', {
    email: normalizedEmail,
    emailRedirectTo: redirectUrl
  })

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectUrl
      }
    })

    if (error) {
      console.error('[Auth Error] Supabase OTP error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        email: normalizedEmail
      })

      let userFriendlyMessage = error.message

      if (
        error.message.includes('Error sending magic link email') ||
        error.name === 'AuthRetryableFetchError' ||
        error.status === 500
      ) {
        userFriendlyMessage =
          'No se pudo enviar el correo de acceso. El servicio de correo de Supabase alcanzó su límite de envíos o requiere un proveedor SMTP configurado en el Dashboard.'
      } else if (error.status === 429 || error.message.includes('rate limit')) {
        userFriendlyMessage =
          'Demasiados intentos seguidos. Aguardá unos minutos antes de volver a solicitar un enlace.'
      }

      redirect(`/login?error=${encodeURIComponent(userFriendlyMessage)}`)
    }

    console.log('[Auth Success] Supabase accepted OTP request:', {
      email: normalizedEmail,
      data
    })
  } catch (err: unknown) {
    // Re-throw Next.js redirect errors so navigation works as expected
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: string }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err
    }

    console.error(
      '[Auth Critical Error] Unexpected failure sending magic link:',
      {
        error: err instanceof Error ? err.stack || err.message : err,
        email: normalizedEmail
      }
    )
    redirect('/login?error=Internal+server+error+sending+email')
  }

  redirect('/login/check-email')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
