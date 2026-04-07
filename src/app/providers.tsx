'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { base } from 'wagmi/chains'
import { baseAccount, injected } from '@wagmi/connectors'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({ appName: 'SecureSwap' }),
    injected({ target: 'metaMask' }),
    injected({ target: 'coinbaseWallet' }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
