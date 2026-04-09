'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { baseAccount } from '@wagmi/connectors';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi';

const queryClient = new QueryClient();

// WalletConnect Project ID (из Reown)
const walletConnectProjectId = 'c4ae8fae-12fd-445e-bb1f-a35d0790b6e2';

// Coinbase API ключ (из CDP)
const coinbaseApiKey = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

// Metadata для WalletConnect
const metadata = {
  name: 'SecureSwap',
  description: 'Trustless atomic swaps between ETH and USDC on Base',
  url: 'https://d-app-base.vercel.app',
  icons: ['https://d-app-base.vercel.app/icon.png'],
};

// Конфигурация Wagmi с обоими ключами
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
    [base.id]: http(`https://api.base.org/rpc?apiKey=${coinbaseApiKey}`),
  },
});

// Настройка Web3Modal (WalletConnect)
createWeb3Modal({
  wagmiConfig: config,
  projectId: walletConnectProjectId,
  metadata,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#0052FF',
    '--w3m-background-color': '#0A0B0D',
  },
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
