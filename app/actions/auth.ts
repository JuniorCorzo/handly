'use server'

import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { redirect } from 'next/navigation'

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/login?error=Email+is+required')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.siteUrl}/auth/callback`
    }
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login/check-email')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
