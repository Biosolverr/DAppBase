'use client'

import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { USDC_ADDRESS, CONTRACT_ADDRESS } from '@/lib/abi/contract'

export function ApproveUSDC({ requiredAmount, onApproved }: { requiredAmount: bigint; onApproved: () => void }) {
  const [isApproved, setIsApproved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { data: allowance, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [CONTRACT_ADDRESS, CONTRACT_ADDRESS], // user → swap contract
  })

  const { writeContractAsync } = useWriteContract()

  useEffect(() => {
    if (allowance && allowance >= requiredAmount) {
      setIsApproved(true)
      onApproved()
    }
  }, [allowance, requiredAmount])

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, requiredAmount],
      })
      await refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isApproved) return null

  return (
    <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-4">
      <p className="text-yellow-400 text-sm mb-3">Approve USDC before funding</p>
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        {isLoading ? 'Approving...' : 'Approve USDC'}
      </button>
    </div>
  )
}
