import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { createClient } from '~/utils/supabase/server'

export async function getUserCalendar() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: calendar } = await supabase
    .from('calendar')
    .select('google_calendar_id')
    .single()

  return calendar
}

export function createCalendarEvent({
  providerToken,
}: {
  providerToken: string
}) {
  return async () => {
    'use server'

    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const session = await supabase.auth.getSession()

    const calendar = await getUserCalendar()

    let calendarId = ''

    if (!calendar) {
      const uuid = Math.random().toString(36).substring(2, 15)
      const data = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${providerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ summary: 'My Calendar ' + uuid }),
        },
      ).then((res) => res.json())

      calendarId = data.id

      await supabase.from('calendar').insert({
        google_calendar_id: calendarId,
        user_id: session.data.session?.user.id,
      })
    } else {
      calendarId = calendar.google_calendar_id
    }

    if (calendarId === '') {
      throw new Error('No calendar found')
    }

    const uuid = Math.random().toString(36).substring(2, 15)

    const eventData = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: 'My Event ' + uuid,
          start: { dateTime: new Date().toISOString() },
          end: {
            dateTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
          },
        }),
      },
    ).then((res) => res.json())

    revalidatePath('/create-event')
  }
}
