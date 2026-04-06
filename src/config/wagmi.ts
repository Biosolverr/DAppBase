import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { base } from 'wagmi/chains'
import { baseAccount } from '@wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'SecureSwap',
      appLogoUrl: 'https://secureswap.vercel.app/logo.png',
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
