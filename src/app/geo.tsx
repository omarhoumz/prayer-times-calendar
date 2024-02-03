'use client'

import { format } from 'date-fns'
import { useEffect, useState } from 'react'

type Location = {
  latitude: number
  longitude: number
}

type TimingType = {
  timings: {
    Fajr: string
    Dhuhr: string
    Asr: string
    Maghrib: string
    Isha: string
  }
  date: {
    readable: string
    gregorian: {
      date: string
      day: string
      weekday: {
        en: string
      }
      month: {
        en: string
        number: number
      }
      year: string
    }
  }
}

function getLocation({
  setLocation,
}: {
  setLocation: React.Dispatch<React.SetStateAction<null | Location>>
}) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        console.log(
          error.code === 1
            ? 'You have denied access to your location'
            : 'Unable to retrieve location',
        )
      },
    )
  } else {
    console.log('Geolocation is not supported by this browser.')
  }
}

export function Geo() {
  const [location, setLocation] = useState<null | Location>(null)

  return (
    <div className='mt-4'>
      {!location ? (
        <button
          className='rounded bg-blue-500 px-4 py-2 text-white'
          onClick={() => getLocation({ setLocation })}
        >
          Get location
        </button>
      ) : (
        <pre>{JSON.stringify(location, null, 2)}</pre>
      )}

      <PrayerTimes location={location} />
    </div>
  )
}

function PrayerTimes({ location }: { location: Location | null }) {
  const [prayerTimes, setPrayerTimes] = useState<null | any>(null)

  useEffect(() => {
    if (!location) return () => {}

    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${location.latitude}&longitude=${location.longitude}&iso8601=true`
    const urlNextMonth = `https://api.aladhan.com/v1/calendar/${year}/${month + 1}?latitude=${location.latitude}&longitude=${location.longitude}&iso8601=true`

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const todayIndex = data?.data?.findIndex((timing: TimingType) => {
          const today = new Date()

          return (
            today.getDate() === Number(timing?.date?.gregorian?.day) &&
            today.getMonth() ===
              Number(timing?.date?.gregorian?.month?.number - 1) &&
            today.getFullYear() === Number(timing?.date?.gregorian?.year)
          )
        })

        setPrayerTimes(data?.data?.slice(todayIndex))

        fetch(urlNextMonth)
          .then((response) => response.json())
          .then((data) => {
            setPrayerTimes((prev: any) => {
              const allData = [...prev, ...data?.data]
              const nextThirtyDays = allData.slice(0, 30)

              return nextThirtyDays
            })
          })
      })
  }, [location])

  const timingKeys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

  return (
    <div className='mt-8 flow-root'>
      <div className='-mx-6 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
        <div className='inline-block min-w-full py-2 align-middle'>
          {!prayerTimes ? null : (
            <table className='min-w-full divide-y divide-gray-300'>
              <thead>
                <tr>
                  <th
                    scope='col'
                    className='py-3.5 pl-4 pr-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500'
                    // className='sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8'
                  >
                    Date
                  </th>
                  {timingKeys.map((key) => {
                    return (
                      <th
                        key={key}
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-medium uppercase tracking-wide text-gray-500'
                        // className='sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8'
                      >
                        {key}
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-200'>
                {prayerTimes.map((timing: TimingType) => {
                  return (
                    <tr
                      key={timing?.date?.readable}
                      className='even:bg-gray-50'
                    >
                      <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900'>
                        {timing?.date?.readable}
                      </td>
                      {Object.entries(timing?.timings).map(([key, value]) => {
                        if (!timingKeys.includes(key)) return null
                        const dateObject = new Date(String(value))
                        const dateFormatted = format(dateObject, 'HH:mm')
                        // add 30 minutes to the date
                        const dateToFormatted = format(
                          new Date(dateObject.getTime() + 30 * 60000),
                          'HH:mm',
                        )
                        return (
                          <td
                            key={key}
                            className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'
                          >
                            {dateFormatted} - {dateToFormatted}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
