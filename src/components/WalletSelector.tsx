'use client'

import { useState } from 'react'
import { useConnect } from 'wagmi'
import { baseAccount, injected } from '@wagmi/connectors'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function WalletSelector({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const { connect } = useConnect()

  const handleConnect = async (type: string) => {
    setLoading(type)
    setError('')
    
    try {
      let connector
      
      if (type === 'base') {
        connector = baseAccount({ 
          appName: 'SecureSwap',
          appLogoUrl: 'https://d-app-base.vercel.app/logo.png'
        })
      } else if (type === 'coinbase') {
        connector = injected({ target: 'coinbaseWallet' })
      } else if (type === 'metamask') {
        // СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ METAMASK
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          throw new Error('MetaMask not installed. Please install it first.')
        }
        
        // Запрашиваем доступ напрямую
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        // Подключаем через wagmi
        connector = injected({ target: () => window.ethereum })
      } else {
        connector = injected({ target: 'walletConnect' })
      }
      
      await connect({ connector })
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || `Failed to connect to ${type}`)
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
            onClick={() => handleConnect('base')}
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
            onClick={() => handleConnect('coinbase')}
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
            onClick={() => handleConnect('metamask')}
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
        </div>
        
        <p className="text-gray-500 text-xs text-center mt-6">
          By connecting, you agree to the terms of service
        </p>
      </div>
    </div>
  )
}
