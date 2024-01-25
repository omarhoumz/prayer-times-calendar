import { Geo } from './geo'

export default function Home() {
  return (
    <main className='container mx-auto px-8 py-12'>
      <h1 className='mb-3 text-2xl'>
        Connect your calendar to your prayer times
      </h1>

      <h3 className='text-lg'>How to connect:</h3>

      <ol className='list-decimal pl-6'>
        <li>Sign in to your Google account</li>
        <li>Click “Allow” to connect your google calendar</li>
        <li>Select a location</li>
        <li>Or get your current location</li>
        <li>Done</li>
      </ol>

      <Geo />
    </main>
  )
}
