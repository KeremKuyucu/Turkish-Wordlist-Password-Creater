import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Password-Generator',
  authors: [{ name: 'Kerem Kuyucu' }],
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
