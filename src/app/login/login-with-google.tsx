'use client'

import { createClient } from '~/utils/supabase/client'

export function LoginWithGoogle() {
  const supabase = createClient()

  function handleLogin() {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: location.origin + '/auth/callback',
      },
    })
  }

  return <button onClick={handleLogin}>Login with Google</button>
}
