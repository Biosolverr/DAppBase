'use client'

import { useWriteContract, useAccount } from 'wagmi'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { useState } from 'react'
import { CooldownGuard } from '@/components/CooldownGuard'

export function WithdrawPanel() {
  const { address } = useAccount()
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState('')
  const { writeContractAsync } = useWriteContract()

  const handleWithdraw = async (type: 'eth' | 'usdc') => {
    setIsWithdrawing(true)
    setError('')
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: type === 'eth' ? 'withdrawEth' : 'withdrawUsdc',
      })
      console.log(`${type} withdraw hash:`, hash)
      alert(`${type.toUpperCase()} withdrawal submitted! Check your wallet.`)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Withdraw failed')
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (!address) return null

  return (
    <CooldownGuard userAddress={address} action="fund">
      {({ isBlocked, remainingSeconds, reason }) => (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h3 className="text-sm font-medium mb-3">Withdraw Funds</h3>
          {error && <div className="bg-red-500/20 text-red-400 p-2 rounded-lg text-xs mb-3">{error}</div>}
          {isBlocked && (
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-2 text-yellow-400 text-xs mb-3">
              ⏳ {reason} {remainingSeconds > 0 && `Wait ${remainingSeconds} seconds.`}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleWithdraw('eth')}
              disabled={isWithdrawing || isBlocked}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw ETH'}
            </button>
            <button
              onClick={() => handleWithdraw('usdc')}
              disabled={isWithdrawing || isBlocked}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw USDC'}
            </button>
          </div>
        </div>
      )}
    </CooldownGuard>
  )
}
