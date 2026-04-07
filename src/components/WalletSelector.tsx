'use client'

import { useState, useEffect } from 'react'
import { useConnect } from 'wagmi'
import { baseAccount } from '@wagmi/connectors'
import { injected } from 'wagmi/connectors'

interface WalletOption {
  id: string
  name: string
  icon: string
  description?: string
  getConnector: () => any
}

declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
    CoinbaseWalletSDK?: any
  }
}

const wallets: WalletOption[] = [
  {
    id: 'base',
    name: 'Base Account',
    icon: '🔵',
    description: 'Smart wallet on Base',
    getConnector: () => baseAccount({ appName: 'SecureSwap' })
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🟦',
    description: 'Extension or mobile app',
    getConnector: () => {
      // Приоритет 1: Coinbase Wallet extension
      if (window.coinbaseWalletExtension) {
        return injected({ target: () => window.coinbaseWalletExtension })
      }
      // Приоритет 2: Стандартный injected для Coinbase
      return injected({ target: 'coinbaseWallet' })
    }
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Browser extension',
    getConnector: () => {
      if (window.ethereum?.isMetaMask) {
        return injected({ target: () => window.ethereum })
      }
      return injected({ target: 'metaMask' })
    }
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Scan QR code',
    getConnector: () => injected({ target: 'walletConnect' })
  }
]

export function WalletSelector({ onClose }: { onClose: () => void }) {
  const { connect, connectors, isPending, error: connectError } = useConnect()
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState<string | null>(null)

  useEffect(() => {
    if (connectError) {
      setError(connectError.message)
    }
  }, [connectError])

  // Проверяем, установлен ли Coinbase Wallet
  const isCoinbaseInstalled = () => {
    return !!window.coinbaseWalletExtension || (window.ethereum?.isCoinbaseWallet === true)
  }

  // Проверяем, установлен ли MetaMask
  const isMetaMaskInstalled = () => {
    return window.ethereum?.isMetaMask === true && !window.ethereum?.isCoinbaseWallet
  }

  const handleConnect = async (wallet: WalletOption) => {
    setError('')
    setConnectingId(wallet.id)
    
    try {
      // Дополнительные проверки перед подключением
      if (wallet.id === 'coinbase' && !isCoinbaseInstalled()) {
        // Предлагаем установить Coinbase Wallet
        const shouldInstall = confirm(
          'Coinbase Wallet extension is not installed.\n\n' +
          'Would you like to install it?'
        )
        if (shouldInstall) {
          window.open('https://www.coinbase.com/wallet/download', '_blank')
        }
        setError('Coinbase Wallet not installed. Please install it first.')
        setConnectingId(null)
        return
      }
      
      if (wallet.id === 'metamask' && !isMetaMaskInstalled()) {
        const shouldInstall = confirm(
          'MetaMask extension is not installed.\n\n' +
          'Would you like to install it?'
        )
        if (shouldInstall) {
          window.open('https://metamask.io/download/', '_blank')
        }
        setError('MetaMask not installed. Please install it first.')
        setConnectingId(null)
        return
      }
      
      const connector = wallet.getConnector()
      
      console.log(`🔄 Connecting to ${wallet.name}...`)
      
      await connect({ connector })
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || `Failed to connect to ${wallet.name}`)
    } finally {
      setConnectingId(null)
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
            ⚠️ {error}
          </div>
        )}
        
        <div className="space-y-3">
          {wallets.map((wallet) => {
            // Определяем статус установки для отображения
            let isInstalled = true
            let installUrl = ''
            
            if (wallet.id === 'coinbase') {
              isInstalled = isCoinbaseInstalled()
              installUrl = 'https://www.coinbase.com/wallet/download'
            }
            if (wallet.id === 'metamask') {
              isInstalled = isMetaMaskInstalled()
              installUrl = 'https://metamask.io/download/'
            }
            
            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                disabled={isPending || connectingId !== null}
                className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50 group"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">{wallet.name}</div>
                  {!isInstalled && (
                    <div className="text-xs text-yellow-400">⚠️ Not installed</div>
                  )}
                  {isInstalled && wallet.description && (
                    <div className="text-xs text-gray-500">{wallet.description}</div>
                  )}
                </div>
                {connectingId === wallet.id && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {!isInstalled && connectingId !== wallet.id && (
                  <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition">Install →</span>
                )}
              </button>
            )
          })}
        </div>
        
        <p className="text-gray-500 text-xs text-center mt-6">
          By connecting, you agree to the terms of service
        </p>
      </div>
    </div>
  )
}
