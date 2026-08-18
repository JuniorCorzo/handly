import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)

  if (error) {
    // "relation does not exist" means the connection works but the table isn't created yet.
    // Any other error likely indicates a bad URL or key.
    return Response.json(
      { connected: false, error: error.message, code: error.code },
      { status: 500 }
    )
  }

  return Response.json({ connected: true, data })
}
