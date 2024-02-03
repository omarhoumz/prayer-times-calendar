import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import AuthButton from './auth-button'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Calendar for prayer times',
  description: 'This is a calendar for prayer times',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className + '  min-h-screen'}>
        <header>
          <div className='container mx-auto flex justify-between gap-4 px-8 py-4'>
            <nav className='flex gap-4'>
              <Link className='underline-offset-4 hover:underline' href='/'>
                Home
              </Link>
              <Link
                className='underline-offset-4 hover:underline'
                href='/create-event'
              >
                Create event
              </Link>
            </nav>

            <AuthButton />
          </div>
        </header>

        {children}
      </body>
    </html>
  )
}
