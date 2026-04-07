'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { useState } from 'react'

export function WithdrawPanel() {
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { writeContractAsync } = useWriteContract()

  const handleWithdraw = async (type: 'eth' | 'usdc') => {
    setIsWithdrawing(true)
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: type === 'eth' ? 'withdrawEth' : 'withdrawUsdc',
      })
      alert(`${type.toUpperCase()} withdrawn!`)
    } catch (error) {
      console.error(error)
      alert('Withdraw failed')
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h3 className="text-sm font-medium mb-3">Withdraw Funds</h3>
      <div className="flex gap-3">
        <button
          onClick={() => handleWithdraw('eth')}
          disabled={isWithdrawing}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
        >
          Withdraw ETH
        </button>
        <button
          onClick={() => handleWithdraw('usdc')}
          disabled={isWithdrawing}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
        >
          Withdraw USDC
        </button>
      </div>
    </div>
  )
}
