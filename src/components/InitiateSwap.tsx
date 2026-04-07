'use client'

import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'

// Генератор случайных bytes32
function generateRandomBytes32(): `0x${string}` {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return ('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`
}

export function InitiateSwap({ onSuccess }: { onSuccess: () => void }) {
  const [counterparty, setCounterparty] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [usdcAmount, setUsdcAmount] = useState('')
  const [duration, setDuration] = useState('3600')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { writeContractAsync } = useWriteContract()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Генерируем случайные значения
      const secret = generateRandomBytes32()
      const nonce = generateRandomBytes32()
      const salt = generateRandomBytes32()
      const secretHash = generateRandomBytes32() // В реальности: keccak256(secret, nonce)

      console.log('Secret (сохрани его где-нибудь!):', secret)
      console.log('Nonce:', nonce)
      console.log('SecretHash:', secretHash)

      // Сохраняем секрет в sessionStorage (чуть безопаснее, чем localStorage)
      sessionStorage.setItem(`swap_secret_${Date.now()}`, secret)

      // Строим commitment
      const commitment = generateRandomBytes32() // TODO: реальный расчёт через buildCommitment

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'initiateFromCommit',
        args: [commitment, salt, secretHash, nonce, counterparty || '0x0000000000000000000000000000000000000000', BigInt(ethAmount), BigInt(usdcAmount), BigInt(duration)],
        value: BigInt(ethAmount),
      })
      
      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to create swap')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-xl text-sm">{error}</div>}
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
