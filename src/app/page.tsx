'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'
import { baseAccount } from '@wagmi/connectors'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { InitiateSwap } from '@/components/InitiateSwap'
import { WithdrawPanel } from '@/components/WithdrawPanel'
import { NetworkWarning } from '@/components/NetworkWarning'
import { CooldownGuard } from '@/components/CooldownGuard'
import { WalletSelector } from '@/components/WalletSelector'
import Jazzicon from '@metamask/jazzicon'

type Tab = 'swaps' | 'initiate' | 'reputation' | 'collusion'

function UserAvatar({ address }: { address: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current && address) {
      ref.current.innerHTML = ''
      ref.current.appendChild(Jazzicon(32, parseInt(address.slice(2, 10), 16)))
    }
  }, [address])
  return <div ref={ref} className="inline-block rounded-full overflow-hidden" />
}

export default function Home() {
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [tab, setTab] = useState<Tab>('swaps')
  const [lookupId, setLookupId] = useState('')
  const [lookedUp, setLookedUp] = useState<`0x${string}` | null>(null)
  const [ethPrice, setEthPrice] = useState(0)

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

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      .then(res => res.json())
      .then(data => setEthPrice(data.ethereum.usd))
      .catch(() => setEthPrice(0))
  }, [])

  const getWalletName = () => {
    const name = connector?.name || ''
    if (name.toLowerCase().includes('base')) return 'Base Account'
    if (name.toLowerCase().includes('coinbase')) return 'Coinbase Wallet'
    if (name.toLowerCase().includes('metamask')) return 'MetaMask'
    return name || 'Wallet'
  }

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
            <p className="text-gray-400 text-sm mb-8">Trustless ETH to USDC atomic swaps on Base</p>
            <button onClick={() => setShowWalletSelector(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium">Connect Wallet</button>
            <p className="text-gray-500 text-xs mt-4">Base Account • Coinbase Wallet • MetaMask • WalletConnect</p>
          </div>
        </div>
        {showWalletSelector && <WalletSelector onClose={() => setShowWalletSelector(false)} />}
      </>
    )
  }

  const tabs = [{ key: 'swaps', label: 'Swaps' }, { key: 'initiate', label: '+ New' }, { key: 'reputation', label: 'Rep' }, { key: 'collusion', label: 'Check' }] as const

  return (
    <>
      <NetworkWarning />
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16 9L9 16L2 9L9 2Z" fill="white"/></svg>
                </div>
                <span className="font-bold">SecureSwap</span>
              </div>
              <div className="flex items-center gap-3">
                {address && <UserAvatar address={address} />}
                <span className="text-xs px-2 py-1 bg-gray-800 rounded-lg text-gray-300">{getWalletName()}</span>
                <span className="text-xs text-gray-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <button onClick={() => disconnect()} className="text-xs text-gray-400 hover:text-white">Disconnect</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-4">
          {address && <WithdrawPanel />}

          <div className="flex rounded-xl overflow-hidden mb-6 bg-gray-900 border border-gray-800">
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)} className={`flex-1 py-2.5 text-xs font-medium ${tab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{label}</button>
            ))}
          </div>

          {tab === 'swaps' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="Paste swap ID (0x...)" className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white" />
                <button onClick={() => setLookedUp(lookupId as `0x${string}`)} className="bg-blue-600 px-4 py-2 rounded-xl text-sm">Load</button>
              </div>
              {!lookedUp && <div className="text-center text-gray-400 py-8">No swaps loaded. Paste a Swap ID above.</div>}
            </div>
          )}

          {tab === 'initiate' && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold mb-4">Create New Swap</h2>
              {ethPrice > 0 && <p className="text-xs text-gray-500 mb-4">1 ETH ≈ ${ethPrice} USD</p>}
              {address && (
                <CooldownGuard userAddress={address} action="initiate">
                  {({ isBlocked, remainingSeconds, reason }) => (
                    <div className="space-y-4">
                      {isBlocked && <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-3 text-yellow-400 text-sm">⏳ {reason} {remainingSeconds > 0 && `Wait ${remainingSeconds} seconds.`}</div>}
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
                <div className="flex justify-between"><span className="text-gray-400">Completed:</span><span className="text-green-400">{(reputation as any)[0]?.toString() || '0'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Griefed:</span><span className="text-red-400">{(reputation as any)[1]?.toString() || '0'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Victimized:</span><span className="text-yellow-400">{(reputation as any)[2]?.toString() || '0'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Score:</span><span className="text-blue-400">{(reputation as any)[5]?.toString() || '0'}</span></div>
              </div>
            </div>
          )}

          {tab === 'collusion' && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-bold mb-4">Collusion Check</h2>
              <p className="text-gray-400 text-sm">Enter two addresses to check collusion flag.</p>
            </div>
          )}
        </div>

        {/* FOOTER с двумя ссылками на GitHub */}
        <footer className="border-t border-gray-800 mt-12 pt-6 pb-4">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <a
                href="https://github.com/Biosolverr/DAppBase"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Frontend (DAppBase)</span>
              </a>
              <span className="text-gray-600">•</span>
              <a
                href="https://github.com/Biosolverr/CONTRAC-BaseEthUsdcSwap"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Smart Contract (BaseEthUsdcSwap)</span>
              </a>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              © 2025 SecureSwap — Trustless. Atomic. On Base.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
