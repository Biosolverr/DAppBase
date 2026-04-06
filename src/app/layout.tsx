import type { Metadata } from 'next'
import { Providers } from './providers'
import '@coinbase/onchainkit/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecureSwap',
  description: 'Trustless ETH to USDC atomic swaps on Base',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
