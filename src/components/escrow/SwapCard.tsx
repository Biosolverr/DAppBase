'use client'

import { useState, useEffect } from 'react'
import { useWriteContract } from 'wagmi'
import toast from 'react-hot-toast'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'

interface SwapCardProps {
  swapId: `0x${string}`
  swap: any
  userAddress: `0x${string}`
  onRefresh?: () => void
}

export function SwapCard({ swapId, swap, userAddress, onRefresh }: SwapCardProps) {
  const [loading, setLoading] = useState(false)
  const [savedSecret, setSavedSecret] = useState<string | null>(null)
  const { writeContractAsync } = useWriteContract()

  const state = swap.state as number
  const isInitiator = swap.initiator?.toLowerCase() === userAddress?.toLowerCase()
  const isCounterparty = swap.counterparty?.toLowerCase() === userAddress?.toLowerCase()
  const isFunded = state === 2
  const isInitiated = state === 1

  const stateLabels = ['EMPTY', 'INITIATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'CANCELLED']
  const stateColors: Record<number, string> = {
    0: '#6B7280', 1: '#F59E0B', 2: '#3B82F6', 3: '#10B981', 4: '#8B5CF6', 5: '#EF4444'
  }

  // Загружаем сохранённый секрет из sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`swap_secret_${swapId}`)
      if (stored) setSavedSecret(stored)
    } catch (e) { /* ignore */ }
  }, [swapId])

  // Скачать секрет в файл
  const downloadSecret = () => {
    if (!savedSecret) {
      toast.error('No secret found for this swap')
      return
    }
    
    const blob = new Blob([savedSecret], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `secret_${swapId.slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Secret saved to file', { icon: '💾' })
  }

  const handleAction = async (action: string, args: any[]) => {
    setLoading(true)
    const tid = toast.loading(`${action} in progress...`)
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: action,
        args,
      })
      toast.dismiss(tid)
      toast.success(`${action} successful!`, {
        duration: 5000,
        icon: '🎉',
      })
      onRefresh?.()
    } catch (err: any) {
      toast.dismiss(tid)
      toast.error(err?.shortMessage || err?.message || `${action} failed`)
    } finally {
      setLoading(false)
    }
  }

  // Прогресс-бар статуса
  const steps = ['Initiated', 'Funded', 'Completed']
  const currentStep = state === 1 ? 0 : state === 2 ? 1 : state === 3 ? 2 : -1

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      {/* Header: Swap ID + ссылка на BaseScan + кнопка сохранения секрета */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">{swapId.slice(0, 10)}...</span>
          <a
            href={`https://basescan.org/tx/${swapId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-400 transition"
            title="View on BaseScan"
          >
            ↗
          </a>
        </div>
        <div className="flex items-center gap-2">
          {savedSecret && (isInitiated || isFunded) && isInitiator && (
            <button
              onClick={downloadSecret}
              className="text-xs text-gray-400 hover:text-yellow-400 transition"
              title="Download secret (backup)"
            >
              💾 Save secret
            </button>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: stateColors[state] + '20', color: stateColors[state] }}
          >
            {stateLabels[state]}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {currentStep >= 0 && (
        <div className="flex gap-1">
          {steps.map((label, idx) => (
            <div key={idx} className="flex-1">
              <div className={`h-1 rounded-full ${idx <= currentStep ? 'bg-blue-500' : 'bg-gray-700'}`} />
              <span className="text-[10px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Amounts */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">ETH</p>
          <p className="font-bold text-green-400">{Number(swap.ethAmount) / 1e18} ETH</p>
        </div>
        <span className="text-gray-500">↔</span>
        <div className="flex-1 bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">USDC</p>
          <p className="font-bold text-blue-400">{Number(swap.usdcAmount) / 1e6} USDC</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {isInitiated && isCounterparty && (
          <button
            onClick={() => handleAction('fund', [swapId])}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-50"
          >
            Fund (USDC)
          </button>
        )}
        {isFunded && isInitiator && (
          <button
            onClick={() => handleAction('complete', [swapId, '0x' + '1'.repeat(64)])}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs disabled:opacity-50"
          >
            Complete
          </button>
        )}
        {isFunded && isCounterparty && (
          <button
            onClick={() => handleAction('claimAsCounterparty', [swapId, '0x' + '1'.repeat(64)])}
            disabled={loading}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs disabled:opacity-50"
          >
            Claim
          </button>
        )}
        {(state === 1 || state === 2) && (isInitiator || isCounterparty) && (
          <button
            onClick={() => handleAction('refund', [swapId])}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs disabled:opacity-50"
          >
            Refund
          </button>
        )}
        {state === 1 && isInitiator && (
          <button
            onClick={() => handleAction('cancel', [swapId])}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
