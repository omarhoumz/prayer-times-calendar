'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.log(error)

  return (
    <div className='container mx-auto px-8 py-6'>
      <h2>Something went wrong!</h2>

      {!error.message ? null : (
        <small className='mt-3 block text-gray-700'>
          <pre>{error.message}</pre>
        </small>
      )}

      <button className='mt-3 block' onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
