'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import toast from 'react-hot-toast'

function generateRandomBytes32(): `0x${string}` {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return ('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`
}

export function InitiateSwap({ onSuccess, disabled }: { onSuccess: () => void; disabled?: boolean }) {
  const { address } = useAccount()
  const [counterparty, setCounterparty] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [usdcAmount, setUsdcAmount] = useState('')
  const [duration, setDuration] = useState('3600')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ eth?: string; usdc?: string; counterparty?: string }>({})

  const { writeContractAsync } = useWriteContract()

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!ethAmount || Number(ethAmount) < 0.001) newErrors.eth = 'Min ETH amount is 0.001'
    if (!usdcAmount || Number(usdcAmount) < 1) newErrors.usdc = 'Min USDC amount is 1'
    if (counterparty && !/^0x[a-fA-F0-9]{40}$/i.test(counterparty)) newErrors.counterparty = 'Invalid address'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (disabled) return
    if (!validate()) return

    setIsLoading(true)
    const tid = toast.loading('Creating swap...')

    try {
      const secret = generateRandomBytes32()
      const nonce = generateRandomBytes32()
      const salt = generateRandomBytes32()
      const secretHash = generateRandomBytes32()
      const commitment = generateRandomBytes32()

      sessionStorage.setItem(`swap_secret_${Date.now()}`, secret)

      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'initiateFromCommit',
        args: [commitment, salt, secretHash, nonce, counterparty || '0x0000000000000000000000000000000000000000', BigInt(ethAmount), BigInt(usdcAmount), BigInt(duration)],
        value: BigInt(ethAmount),
      })

      toast.dismiss(tid)
      toast.success('Swap created successfully!', { icon: '🎉' })
      onSuccess()
    } catch (err: any) {
      toast.dismiss(tid)
      toast.error(err?.message || 'Failed to create swap')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Counterparty address (0x0 for anyone)"
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          className={`w-full bg-gray-800 border rounded-xl px-4 py-2 text-white ${errors.counterparty ? 'border-red-500' : 'border-gray-700'}`}
        />
        {errors.counterparty && <p className="text-red-400 text-xs mt-1">{errors.counterparty}</p>}
      </div>
      <div>
        <input
          type="number"
          placeholder="ETH amount (min 0.001)"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
          className={`w-full bg-gray-800 border rounded-xl px-4 py-2 text-white ${errors.eth ? 'border-red-500' : 'border-gray-700'}`}
        />
        {errors.eth && <p className="text-red-400 text-xs mt-1">{errors.eth}</p>}
      </div>
      <div>
        <input
          type="number"
          placeholder="USDC amount (min 1)"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(e.target.value)}
          className={`w-full bg-gray-800 border rounded-xl px-4 py-2 text-white ${errors.usdc ? 'border-red-500' : 'border-gray-700'}`}
        />
        {errors.usdc && <p className="text-red-400 text-xs mt-1">{errors.usdc}</p>}
      </div>
      <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white">
        <option value="3600">1 hour</option>
        <option value="86400">1 day</option>
        <option value="604800">7 days</option>
      </select>
      <button type="submit" disabled={disabled || isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium disabled:opacity-50">
        {isLoading ? 'Creating...' : 'Create Swap'}
      </button>
    </form>
  )
}
