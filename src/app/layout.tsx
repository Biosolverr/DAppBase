import type { Metadata } from 'next'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecureSwap',
  description: 'Trustless atomic swaps between ETH and USDC on Base chain. MAD collateral, reputation scoring, anti-griefing.',
  keywords: 'atomic swap, base chain, eth, usdc, defi, secure swap, trustless',
  authors: [{ name: 'SecureSwap Team' }],
  openGraph: {
    title: 'SecureSwap - Atomic ETH/USDC Swaps on Base',
    description: 'Trustless peer-to-peer atomic swaps between ETH and USDC on Base with MAD collateral.',
    url: 'https://d-app-base.vercel.app',
    siteName: 'SecureSwap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecureSwap - Atomic ETH/USDC Swaps on Base',
    description: 'Trustless peer-to-peer atomic swaps on Base.',
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
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1E2028',
                color: '#fff',
                border: '1px solid #2a2d38',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' },
                duration: 5000,
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' },
                duration: 5000,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
