'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'react-hot-toast'
import { CONTRACT_ADDRESS, ABI } from '@/lib/constants'

interface WithdrawPanelProps {
  refetch: () => void
}

export default function WithdrawPanel({ refetch }: WithdrawPanelProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const { chain, address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const handleWithdraw = async (type: 'eth' | 'usdc') => {
    if (!chain?.id || !address) {
      toast.error('Please connect your wallet')
      return
    }

    setIsWithdrawing(true)
    const tid = toast.loading(`Withdrawing ${type.toUpperCase()}...`)
    
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: type === 'eth' ? 'withdrawEth' : 'withdrawUsdc',
        chainId: chain.id,
        account: address,
      })
      
      toast.dismiss(tid)
      toast.success(`${type.toUpperCase()} withdrawn successfully!`)
      refetch()
    } catch (error: any) {
      toast.dismiss(tid)
      toast.error(error?.message || `Failed to withdraw ${type.toUpperCase()}`)
      console.error('Withdraw error:', error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
      <div className="space-y-4">
        <button
          onClick={() => handleWithdraw('eth')}
          disabled={isWithdrawing}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? 'Processing...' : 'Withdraw ETH'}
        </button>
        <button
          onClick={() => handleWithdraw('usdc')}
          disabled={isWithdrawing}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? 'Processing...' : 'Withdraw USDC'}
        </button>
      </div>
    </div>
  )
}
