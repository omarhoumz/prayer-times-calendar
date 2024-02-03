'use client'

import { CustomFormSubmit } from './custom-button'

export function CreateEventButton() {
  return (
    <CustomFormSubmit>
      {(pending) => (pending ? 'Creating Event...' : 'Create Event')}
    </CustomFormSubmit>
  )
}
