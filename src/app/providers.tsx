'use client'

import { OnchainKitProvider } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { createConfig, http } from 'wagmi'
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors'
import { Toaster } from 'react-hot-toast'

const chain = process.env.NEXT_PUBLIC_CHAIN === 'baseSepolia' ? baseSepolia : base

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'SecureSwap',
      preference: 'smartWalletOnly',
    }),
    metaMask(),
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={chain}
          config={{
            appearance: { name: 'SecureSwap', theme: 'dark', mode: 'auto' },
            wallet: { display: 'modal', termsUrl: '', privacyUrl: '' },
          }}
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#13141A',
                color: '#fff',
                border: '1px solid #1E2028',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
