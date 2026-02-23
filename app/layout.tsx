import type { Metadata, Viewport } from 'next'
import { Noto_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const notoSans = Noto_Sans({ subsets: ['latin', 'devanagari'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'E-Ration Card Management System | Government of India',
  description: 'National Food Security Act - Public Distribution System. Manage ration cards, check stock availability, shop timings and upcoming ration schedules.',
}

export const viewport: Viewport = {
  themeColor: '#0C4A6E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${notoSans.className} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
