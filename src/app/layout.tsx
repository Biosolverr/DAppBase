import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'
import '@coinbase/onchainkit/styles.css'

export const metadata: Metadata = {
  title: 'SecureSwap — ETH ↔ USDC on Base',
  description: 'Trustless atomic swaps between ETH and USDC on Base',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SecureSwap' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0B0D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
