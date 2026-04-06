'use client'

import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { ABI, CONTRACT_ADDRESS } from '@/lib/constants'

export function InitiateSwap({ onSuccess }: { onSuccess: () => void }) {
  const [counterparty, setCounterparty] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [usdcAmount, setUsdcAmount] = useState('')
  const [duration, setDuration] = useState('3600')
  const [isLoading, setIsLoading] = useState(false)

  const { writeContractAsync } = useWriteContract()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const secretHash = '0x' + '1'.repeat(64)
      const nonce = '0x' + '2'.repeat(64)
      const salt = '0x' + '3'.repeat(64)

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'initiateFromCommit',
        args: [secretHash, nonce, counterparty, BigInt(ethAmount), BigInt(usdcAmount), BigInt(duration), salt],
        value: BigInt(ethAmount),
      })
      onSuccess()
    } catch (error) {
      console.error(error)
      alert('Failed to create swap')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Counterparty address (0x0 for anyone)"
        value={counterparty}
        onChange={(e) => setCounterparty(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white"
      />
      <input
        type="number"
        placeholder="ETH amount"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white"
      />
      <input
        type="number"
        placeholder="USDC amount"
        value={usdcAmount}
        onChange={(e) => setUsdcAmount(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white"
      />
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white"
      >
        <option value="3600">1 hour</option>
        <option value="86400">1 day</option>
        <option value="604800">7 days</option>
      </select>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Swap'}
      </button>
    </form>
  )
}
