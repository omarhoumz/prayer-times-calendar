'use client'

import { useFormStatus } from 'react-dom'

export function LogoutButton() {
  const { pending } = useFormStatus()

  return (
    <button className='block min-w-[90px] text-end'>
      {pending ? 'Login out' : 'Logout'}
    </button>
  )
}
