'use client'

import { useState } from 'react'

declare global {
  interface Window {
    ethereum?: any
    coinbaseWalletExtension?: any
  }
}

export function WalletSelector({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  // ========== ПОДКЛЮЧЕНИЕ META MASK ==========
  const connectMetaMask = async () => {
    setLoading('metamask')
    setError('')
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Install it first.')
      }
      
      // Запрашиваем доступ
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Unlock MetaMask.')
      }
      
      // Обновляем страницу, чтобы Wagmi подхватил аккаунт
      window.location.reload()
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect MetaMask')
    } finally {
      setLoading(null)
    }
  }

  // ========== ПОДКЛЮЧЕНИЕ COINBASE WALLET ==========
  const connectCoinbase = async () => {
    setLoading('coinbase')
    setError('')
    
    try {
      // Способ 1: через расширение Coinbase
      if (window.coinbaseWalletExtension) {
        const accounts = await window.coinbaseWalletExtension.request({
          method: 'eth_requestAccounts'
        })
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Unlock Coinbase Wallet.')
        }
        
        window.location.reload()
        return
      }
      
      // Способ 2: через window.ethereum (если активен Coinbase)
      if (window.ethereum?.isCoinbaseWallet === true) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found. Unlock Coinbase Wallet.')
        }
        
        window.location.reload()
        return
      }
      
      throw new Error('Coinbase Wallet not installed.')
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect Coinbase Wallet')
    } finally {
      setLoading(null)
    }
  }

  // ========== ПОДКЛЮЧЕНИЕ BASE ACCOUNT ==========
  const connectBaseAccount = async () => {
    setLoading('base')
    setError('')
    
    try {
      const { connect } = await import('wagmi')
      const { baseAccount } = await import('@wagmi/connectors')
      
      const connector = baseAccount({ appName: 'SecureSwap' })
      await connect({ connector })
      
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to connect Base Account')
    } finally {
      setLoading(null)
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
          {/* Base Account */}
          <button
            onClick={connectBaseAccount}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">🔵</span>
            <div className="flex-1 text-left">
              <div className="text-white font-medium">Base Account</div>
              <div className="text-xs text-gray-500">Smart wallet on Base</div>
            </div>
            {loading === 'base' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          </button>
          
          {/* Coinbase Wallet */}
          <button
            onClick={connectCoinbase}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">🟦</span>
            <div className="flex-1 text-left">
              <div className="text-white font-medium">Coinbase Wallet</div>
              <div className="text-xs text-gray-500">Extension or mobile app</div>
            </div>
            {loading === 'coinbase' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          </button>
          
          {/* MetaMask */}
          <button
            onClick={connectMetaMask}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">🦊</span>
            <div className="flex-1 text-left">
              <div className="text-white font-medium">MetaMask</div>
              <div className="text-xs text-gray-500">Browser extension</div>
            </div>
            {loading === 'metamask' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          </button>
          
          {/* WalletConnect */}
          <button
            onClick={async () => {
              setLoading('walletconnect')
              try {
                const { connect } = await import('wagmi')
                const { injected } = await import('@wagmi/connectors')
                await connect({ connector: injected({ target: 'walletConnect' }) })
                onClose()
              } catch (err: any) {
                setError(err.message)
              } finally {
                setLoading(null)
              }
            }}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">🔗</span>
            <div className="flex-1 text-left">
              <div className="text-white font-medium">WalletConnect</div>
              <div className="text-xs text-gray-500">Scan QR code</div>
            </div>
            {loading === 'walletconnect' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          </button>
        </div>
        
        <p className="text-gray-500 text-xs text-center mt-6">
          By connecting, you agree to the terms of service
        </p>
      </div>
    </div>
  )
}
