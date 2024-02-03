import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { createClient } from '~/utils/supabase/server'
import { CustomFormSubmit } from '../create-event/custom-button'
import { LoginWithGoogle } from './login-with-google'

export default async function LoginPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  return (
    <main className='container mx-auto px-8 py-12'>
      <h1 className='mb-3 text-2xl'>Login</h1>

      <LoginWithGoogle />
    </main>
  )
}
