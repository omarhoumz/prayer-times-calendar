'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '~/utils/cn'

export function CustomFormSubmit({
  disabled,
  children,
  className,
}: {
  disabled?: boolean
  children: React.ReactNode | ((pending: boolean) => React.ReactNode)
  className?: string
}) {
  const { pending } = useFormStatus()

  const ariaDisabled = disabled || pending ? 'true' : null

  return (
    <button
      className={cn(
        'block rounded bg-blue-500 px-4 py-2 text-white',
        className,
      )}
      type='submit'
      area-disabled={ariaDisabled}
    >
      {typeof children === 'function'
        ? children(pending)
        : pending
          ? 'Loading ...'
          : children}
    </button>
  )
}
