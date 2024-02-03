import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '~/utils/supabase/actions'

export async function signOut() {
  'use server'

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  await supabase.auth.signOut()
  return redirect('/login')
}
