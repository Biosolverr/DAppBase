'use client'

import { useState } from 'react'
import { useConnect } from 'wagmi'
import { baseAccount } from '@wagmi/connectors'
import { injected } from 'wagmi/connectors'

interface WalletOption {
  id: string
  name: string
  icon: string
  connector: any
}

const wallets: WalletOption[] = [
  {
    id: 'base',
    name: 'Base Account',
    icon: '🟦',
    connector: baseAccount({ appName: 'SecureSwap' })
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🟦',
    connector: injected({ target: 'coinbaseWallet' })
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    connector: injected({ target: 'metaMask' })
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    connector: injected({ target: 'walletConnect' })
  }
]

export function WalletSelector({ onClose }: { onClose: () => void }) {
  const { connect, isPending } = useConnect()
  const [error, setError] = useState('')

  const handleConnect = async (wallet: WalletOption) => {
    setError('')
    try {
      await connect({ connector: wallet.connector })
      onClose()
    } catch (err: any) {
      setError(err?.message || `Failed to connect to ${wallet.name}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet)}
              disabled={isPending}
              className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
            >
              <span className="text-2xl">{wallet.icon}</span>
              <span className="text-white font-medium flex-1 text-left">{wallet.name}</span>
              {isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            </button>
          ))}
        </div>
        
        <p className="text-gray-500 text-xs text-center mt-6">
          By connecting, you agree to the terms of service
        </p>
      </div>
    </div>
  )
}
