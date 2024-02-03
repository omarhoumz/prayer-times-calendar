import { cookies } from 'next/headers'
import Link from 'next/link'

import { createClient } from '~/utils/supabase/server'
import { signOut } from './actions'
import { LogoutButton } from './logout-button'

export default async function AuthButton() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ? (
    <div className='flex items-center gap-4'>
      Hey, {user.user_metadata.full_name ?? user.email}!
      <form action={signOut}>
        <LogoutButton />
      </form>
    </div>
  ) : (
    <Link href='/login'>Login</Link>
  )
}
