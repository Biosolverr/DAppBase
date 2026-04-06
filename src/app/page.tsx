'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from '@coinbase/onchainkit/wallet'
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity'
import { InitiateSwap } from '@/components/escrow/InitiateSwap'
import { SwapCard } from '@/components/escrow/SwapCard'
import { WithdrawPanel } from '@/components/escrow/WithdrawPanel'
import { ReputationCard } from '@/components/escrow/ReputationCard'
import { CollusionCheck } from '@/components/escrow/CollusionCheck'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'

type Tab = 'swaps' | 'initiate' | 'reputation' | 'collusion'

export default function Home() {
  const { address, isConnected } = useAccount()
  const [tab, setTab] = useState<Tab>('swaps')
  const [lookupId, setLookupId] = useState('')
  const [lookedUp, setLookedUp] = useState<`0x${string}` | null>(null)

  const { data: lookupSwap } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getSwap',
    args: [lookedUp as `0x${string}`],
    query: { enabled: !!lookedUp },
  })

  if (!isConnected) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'var(--bg)' }}
      >
        <div className="w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 5L31 18L18 31L5 18L18 5Z" fill="white" fillOpacity="0.9"/>
              <path d="M18 11L25 18L18 25L11 18L18 11Z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">SecureSwap</h1>
          <p className="text-gray-400 text-sm mb-8">
            Trustless ETH to USDC atomic swaps on Base
          </p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
          <p className="text-xs text-gray-500 mt-4">Powered by Base + OnchainKit</p>
        </div>
      </main>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'swaps', label: 'Swaps' },
    { key: 'initiate', label: '+ New' },
    { key: 'reputation', label: 'Rep' },
    { key: 'collusion', label: 'Check' },
  ]

  return (
    <main
      className="min-h-screen max-w-lg mx-auto p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex items-center justify-between py-4 mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16 9L9 16L2 9L9 2Z" fill="white" fillOpacity="0.9"/>
              <path d="M9 5.5L12.5 9L9 12.5L5.5 9L9 5.5Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold">SecureSwap</span>
        </div>
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-7 w-7" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      {address && (
        <div className="mb-4">
          <WithdrawPanel />
        </div>
      )}

      <div
        className="flex rounded-xl overflow-hidden mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2.5 text-xs font-medium transition-colors"
            style={{
              background: tab === key ? 'var(--accent)' : 'transparent',
              color: tab === key ? '#fff' : '#6B7280',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'initiate' && (
        <InitiateSwap onSuccess={() => setTab('swaps')} />
      )}

      {tab === 'reputation' && address && (
        <ReputationCard address={address} />
      )}

      {tab === 'collusion' && (
        <CollusionCheck />
      )}

      {tab === 'swaps' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              placeholder="Paste swap ID (0x...)"
              className="flex-1 rounded-xl px-3 py-2 text-xs text-white outline-none"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            />
            <button
              onClick={() => setLookedUp(lookupId as `0x${string}`)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-white"
              style={{ background: 'var(--accent)' }}
            >
              Load
            </button>
          </div>

          {lookedUp && lookupSwap && (lookupSwap as any).state !== 0 && (
            <SwapCard
              swapId={lookedUp}
              swap={lookupSwap}
              userAddress={address!}
            />
          )}

          {lookedUp && lookupSwap && (lookupSwap as any).state === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              Swap not found
            </div>
          )}

          {!lookedUp && (
            <div className="text-center text-gray-400 text-sm py-8">
              <p className="mb-2">No swaps loaded</p>
              <p className="text-xs text-gray-500">
                Paste a Swap ID above or initiate a new swap
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
