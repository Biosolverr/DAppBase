'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount } from '@wagmi/connectors';
import { erc8021 } from 'ox';

const queryClient = new QueryClient();

// Твой Builder Code от Base.dev
const DATA_SUFFIX = erc8021.Attribution.toDataSuffix({
  codes: ['bc_mxglfaw8'],
});

const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'SecureSwap',
      appLogoUrl: 'https://d-app-base.vercel.app/logo.png',
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
  },
  dataSuffix: DATA_SUFFIX,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
