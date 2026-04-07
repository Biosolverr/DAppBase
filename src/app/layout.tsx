import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecureSwap',
  description: 'Trustless atomic swaps between ETH and USDC on Base chain. MAD collateral, reputation scoring, anti-griefing.',
  keywords: 'atomic swap, base chain, eth, usdc, defi, secure swap, trustless',
  authors: [{ name: 'SecureSwap Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'SecureSwap - Atomic ETH/USDC Swaps on Base',
    description: 'Trustless peer-to-peer atomic swaps between ETH and USDC on Base with MAD collateral and reputation system.',
    url: 'https://d-app-base.vercel.app',
    siteName: 'SecureSwap',
    images: [
      {
        url: 'https://d-app-base.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SecureSwap - Atomic Swaps on Base',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecureSwap - Atomic ETH/USDC Swaps on Base',
    description: 'Trustless peer-to-peer atomic swaps between ETH and USDC on Base.',
    images: ['https://d-app-base.vercel.app/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
