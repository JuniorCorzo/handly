/**
 * Server-side environment variables.
 *
 * This module must NEVER be imported from client components.
 * Variables here intentionally omit the NEXT_PUBLIC_ prefix so
 * Next.js never inlines them into the browser bundle.
 *
 * Add and validate every server env var here — a missing variable
 * throws at startup, not silently at runtime.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: "${name}". ` +
        `Make sure it is defined in .env.local (development) or in your deployment environment.`
    )
  }
  return value
}

export const env = {
  supabase: {
    url: requireEnv('SUPABASE_URL'),
    anonKey: requireEnv('SUPABASE_ANON_KEY')
  },
  siteUrl: requireEnv('SITE_URL')
} as const
