import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '~/utils/supabase/server'
import { createCalendarEvent, getUserCalendar } from './actions'
import { CreateEventButton } from './create-event'
import { CustomFormSubmit } from './custom-button'

type RenderableEvent = {
  summary: string
  start: string
  end: string
  startDateTime: string
  endDatetime: string
  raw: any
}

type RenderableCalendar = {
  id: string
  name: string
  raw: any
}

export default async function CreateEventPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const providerToken = session.provider_token!

  const calendar = await getUserCalendar()

  const calendarId = calendar?.google_calendar_id ?? 'primary'
  const data = await getEvents({ providerToken, calendarId })

  const events: RenderableEvent[] | [] =
    data?.items?.map((item: any) => {
      const isCancelled = item.status === 'cancelled'

      const isSameDay =
        item.start?.dateTime?.slice(0, 10) === item.end?.dateTime?.slice(0, 10)

      function formatDate(date: string) {
        if (isSameDay) {
          return format(new Date(date), 'hh:mm a')
        } else {
          return format(new Date(date), 'yyyy-MM-dd hh:mm a')
        }
      }

      return {
        summary: item.summary,
        start: isCancelled
          ? 'cancelled'
          : formatDate(item.start?.dateTime ?? item.start?.date),
        end: isCancelled
          ? 'cancelled'
          : formatDate(item.end?.dateTime ?? item.end?.date),
        startDateTime: item.start?.dateTime ?? item.start?.date,
        endDatetime: item.end?.dateTime ?? item.end?.date,
        raw: item,
      }
    }) ?? []

  const calendars: RenderableCalendar[] | [] =
    (await getCalendars({
      providerToken,
    }).then((data) =>
      data.items
        ?.filter(
          (item: any) => item.accessRole === 'owner' && item.primary !== true,
        )
        .map((item: any) => {
          return {
            id: item.id,
            name: item.summary,
            raw: item,
          }
        }),
    )) ?? []

  return (
    <main className='container mx-auto px-8 py-12'>
      <form action={createCalendarEvent({ providerToken })}>
        <CreateEventButton />
      </form>

      <h2 className='mt-4 text-xl'>Calendars</h2>
      {calendars.length === 0 ? (
        <p className='mt-2 text-gray-500'>No calendars found</p>
      ) : (
        <ul className='mt-2'>
          {calendars.map((calendar) => (
            <li
              key={calendar.id}
              className='my-4 flex flex-auto items-center justify-between rounded border p-4'
            >
              <p className='font-medium text-gray-900'>{calendar.name}</p>

              <form
                action={async () => {
                  'use server'

                  const cookieStore = cookies()
                  const supabase = createClient(cookieStore)

                  const response = await fetch(
                    `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendar.id}`,
                    {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${providerToken}` },
                    },
                  )

                  const resp2 = await supabase
                    .from('calendar')
                    .delete()
                    .eq('google_calendar_id', calendar.id)

                  if (response.ok && resp2.error === null) {
                    revalidatePath('/create-event')
                  }
                }}
              >
                <CustomFormSubmit className='bg-transparent p-0 text-red-700'>
                  Delete
                </CustomFormSubmit>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className='mt-4 text-xl'>Events</h2>
      <ul>
        {events.map((event) => (
          <li
            key={event.raw.id}
            className='my-4 flex-auto rounded border p-4 text-gray-500'
          >
            <p className='font-medium text-gray-900'>{event.summary}</p>
            <p className='mt-0.5'>
              <time dateTime={event.startDateTime}>{event.start}</time> -{' '}
              <time dateTime={event.endDatetime}>{event.end}</time>
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}

async function getEvents({
  providerToken,
  calendarId,
}: {
  providerToken: string
  calendarId: string
}) {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const timeMin = date.toISOString()

  const params = {
    timeMin,
    maxResults: '4',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    showDeleted: 'false',
    singleEvents: 'true',
    orderBy: 'startTime',
    eventType: 'default',
  }

  // encode the parameters to be used in the query string
  const query = new URLSearchParams(params).toString()

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${query}`,
    { headers: { Authorization: `Bearer ${providerToken}` } },
  )

  return response.json()
}

async function getCalendars({ providerToken }: { providerToken: string }) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList`,
    { headers: { Authorization: `Bearer ${providerToken}` } },
  )

  return response.json()
}
