'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'
import { baseAccount } from '@wagmi/connectors'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { InitiateSwap } from '@/components/InitiateSwap'
import { WithdrawPanel } from '@/components/WithdrawPanel'
import { NetworkWarning } from '@/components/NetworkWarning'
import { CooldownGuard } from '@/components/CooldownGuard'

type Tab = 'swaps' | 'initiate' | 'reputation' | 'collusion'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [tab, setTab] = useState<Tab>('swaps')
  const [lookupId, setLookupId] = useState('')
  const [lookedUp, setLookedUp] = useState<`0x${string}` | null>(null)

  const { data: lookupSwap, refetch: refetchSwap } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getSwap',
    args: [lookedUp as `0x${string}`],
    query: { enabled: !!lookedUp },
  })

  const { data: reputation } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getReputation',
    args: [address],
    query: { enabled: !!address },
  })

  if (!isConnected) {
    return (
      <>
        <NetworkWarning />
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M18 5L31 18L18 31L5 18L18 5Z" fill="white" fillOpacity="0.9"/>
                <path d="M18 11L25 18L18 25L11 18L18 11Z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">SecureSwap</h1>
            <p className="text-gray-400 text-sm mb-8">
              Trustless ETH to USDC atomic swaps on Base
            </p>
            <button
              onClick={() => connect({ connector: baseAccount({ appName: 'SecureSwap' }) })}
              disabled={isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {isPending ? 'Connecting...' : 'Connect Base Account'}
            </button>
            <p className="text-gray-500 text-xs mt-4">Powered by Base Account SDK</p>
          </div>
        </div>
      </>
    )
  }

  const tabs = [
    { key: 'swaps', label: 'Swaps' },
    { key: 'initiate', label: '+ New' },
    { key: 'reputation', label: 'Rep' },
    { key: 'collusion', label: 'Check' },
  ] as const

  return (
    <>
      <NetworkWarning />
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L16 9L9 16L2 9L9 2Z" fill="white"/>
                  </svg>
                </div>
                <span className="font-bold text-white">SecureSwap</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button onClick={() => disconnect()} className="text-xs text-gray-400 hover:text-white transition">
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-4">
          {address && (
            <div className="mb-4">
              <WithdrawPanel />
            </div>
          )}

          <div className="flex rounded-xl overflow-hidden mb-6 bg-gray-900 border border-gray-800">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                  tab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'swaps' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="Paste swap ID (0x...)"
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setLookedUp(lookupId as `0x${string}`)}
                  className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  Load
                </button>
              </div>

              {lookedUp && lookupSwap && (lookupSwap as any).state !== 0 && (
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">State:</span>
                      <span className="text-blue-400">
                        {['EMPTY', 'INITIATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'CANCELLED'][(lookupSwap as any).state]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ETH Amount:</span>
                      <span>{(lookupSwap as any).ethAmount / 1e18} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USDC Amount:</span>
                      <span>{(lookupSwap as any).usdcAmount / 1e6} USDC</span>
                    </div>
                  </div>
                </div>
              )}

              {!lookedUp && (
                <div className="text-center text-gray-400 py-8">
                  <p className="mb-2">No swaps loaded</p>
                  <p className="text-xs text-gray-500">Paste a Swap ID above or go to "+ New" to create a swap</p>
                </div>
              )}
            </div>
          )}

          {tab === 'initiate' && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold mb-4">Create New Swap</h2>
              {address && (
                <CooldownGuard userAddress={address} action="initiate">
                  {({ isBlocked, remainingSeconds, reason }) => (
                    <div className="space-y-4">
                      {isBlocked && (
                        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-3 text-yellow-400 text-sm">
                          ⏳ {reason} {remainingSeconds > 0 && `Wait ${remainingSeconds} seconds.`}
                        </div>
                      )}
                      <InitiateSwap onSuccess={() => setTab('swaps')} disabled={isBlocked} />
                    </div>
                  )}
                </CooldownGuard>
              )}
            </div>
          )}

          {tab === 'reputation' && reputation && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold mb-4">Your Reputation</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed swaps:</span>
                  <span className="text-green-400">{(reputation as any)[0]?.toString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Score:</span>
                  <span className="text-blue-400">{(reputation as any)[5]?.toString() || '0'}</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'collusion' && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold mb-4">Collusion Check</h2>
              <p className="text-gray-400 text-sm">Enter two addresses to check if they are flagged for collusion.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
