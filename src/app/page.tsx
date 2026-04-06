'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { baseAccount } from '@wagmi/connectors'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">SecureSwap</h1>
          <p className="text-gray-400 mb-8">Trustless ETH ⇄ USDC on Base</p>
          <button
            onClick={() => connect({ connector: baseAccount({ appName: 'SecureSwap' }) })}
            disabled={isPending}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50"
          >
            {isPending ? 'Connecting...' : 'Connect Base Account'}
          </button>
          <p className="text-gray-500 text-sm mt-8">
            Requires Coinbase Wallet extension
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">SecureSwap</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Disconnect
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-xl p-6 text-center">
          <p className="text-green-400 mb-2">✓ Connected to Base</p>
          <p className="text-gray-400 text-sm">Your wallet is ready</p>
        </div>
      </div>
    </div>
  )
}
