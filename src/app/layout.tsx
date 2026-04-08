import type { Metadata } from 'next'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecureSwap',
  description: 'Trustless atomic swaps between ETH and USDC on Base chain',
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
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
