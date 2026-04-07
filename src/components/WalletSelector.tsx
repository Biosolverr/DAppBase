'use client'

import { useState } from 'react'
import { baseAccount } from '@wagmi/connectors'

declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
  }
}

interface WalletOption {
  id: string
  name: string
  icon: string
  description?: string
  connect: () => Promise<any>
}

export function WalletSelector({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState<string | null>(null)

  // Проверка установки MetaMask
  const isMetaMaskInstalled = () => {
    return window.ethereum?.isMetaMask === true
  }

  // Проверка установки Coinbase Wallet
  const isCoinbaseInstalled = () => {
    return !!window.coinbaseWalletExtension || window.ethereum?.isCoinbaseWallet === true
  }

  // Подключение через Base Account (через Wagmi)
  const connectBaseAccount = async () => {
    const { connect } = await import('wagmi')
    const connector = baseAccount({ appName: 'SecureSwap' })
    await connect({ connector })
  }

  // ========== ПРЯМОЕ ПОДКЛЮЧЕНИЕ META MASK ==========
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found. Please install MetaMask or Coinbase Wallet.')
    }
    
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install it first.')
    }
    
    // Запрашиваем доступ к аккаунтам
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock MetaMask.')
    }
    
    // Подключаем через Wagmi с явным указанием провайдера
    const { connect } = await import('wagmi')
    const { injected } = await import('@wagmi/connectors')
    
    const connector = injected({
      target: () => window.ethereum
    })
    
    await connect({ connector })
  }

  // ========== ПРЯМОЕ ПОДКЛЮЧЕНИЕ COINBASE WALLET ==========
  const connectCoinbase = async () => {
    // Приоритет 1: Coinbase Wallet extension
    if (window.coinbaseWalletExtension) {
      const accounts = await window.coinbaseWalletExtension.request({
        method: 'eth_requestAccounts'
      })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock Coinbase Wallet.')
      }
      
      const { connect } = await import('wagmi')
      const { injected } = await import('@wagmi/connectors')
      
      const connector = injected({
        target: () => window.coinbaseWalletExtension
      })
      
      await connect({ connector })
      return
    }
    
    // Приоритет 2: Coinbase через window.ethereum (если он активен)
    if (window.ethereum?.isCoinbaseWallet === true) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock Coinbase Wallet.')
      }
      
      const { connect } = await import('wagmi')
      const { injected } = await import('@wagmi/connectors')
      
      const connector = injected({
        target: () => window.ethereum
      })
      
      await connect({ connector })
      return
    }
    
    // Если ничего не сработало — предлагаем установить
    throw new Error('Coinbase Wallet is not installed. Please install it first.')
  }

  // Подключение через WalletConnect (через Wagmi)
  const connectWalletConnect = async () => {
    const { connect } = await import('wagmi')
    const { injected } = await import('@wagmi/connectors')
    
    const connector = injected({ target: 'walletConnect' })
    await connect({ connector })
  }

  const wallets: WalletOption[] = [
    {
      id: 'base',
      name: 'Base Account',
      icon: '🔵',
      description: 'Smart wallet on Base',
      connect: connectBaseAccount
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🟦',
      description: isCoinbaseInstalled() ? '✓ Extension found' : '⚠️ Not installed',
      connect: connectCoinbase
    },
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: isMetaMaskInstalled() ? '✓ Extension found' : '⚠️ Not installed',
      connect: connectMetaMask
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Scan QR code with any wallet',
      connect: connectWalletConnect
    }
  ]

  const handleConnect = async (wallet: WalletOption) => {
    setError('')
    setConnectingId(wallet.id)
    
    try {
      await wallet.connect()
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
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet)}
              disabled={connectingId !== null}
              className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
            >
              <span className="text-2xl">{wallet.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-white font-medium">{wallet.name}</div>
                {wallet.description && (
                  <div className={`text-xs ${wallet.description.includes('Not') ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {wallet.description}
                  </div>
                )}
              </div>
              {connectingId === wallet.id && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
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
