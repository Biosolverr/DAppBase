'use client'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button, Card } from '@/components/ui'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { formatEthAmount, formatUsdcAmount } from '@/lib/utils/crypto'

export function WithdrawPanel() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [loading, setLoading] = useState<'eth' | 'usdc' | null>(null)

  const { data: pending, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'getPendingWithdrawals',
    args: [address!], query: { enabled: !!address, refetchInterval: 10000 },
  })

  const pendingEth = pending ? (pending as any)[0] : 0n
  const pendingUsdc = pending ? (pending as any)[1] : 0n

  if (!pendingEth && !pendingUsdc) return null

  const withdraw = async (type: 'eth' | 'usdc') => {
    setLoading(type)
    const tid = toast.loading(`Withdrawing ${type.toUpperCase()}...`)
    try {
      await writeContractAsync({ address: CONTRACT_ADDRESS, abi: ABI, functionName: type === 'eth' ? 'withdrawEth' : 'withdrawUsdc' })
      toast.dismiss(tid)
      toast.success(`${type.toUpperCase()} withdrawn!`)
      refetch()
    } catch (e: any) {
      toast.dismiss(tid)
      toast.error(e.shortMessage || e.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="border-green-500/30">
      <h3 className="font-bold text-sm mb-3 text-green-400">💰 Pending Withdrawals</h3>
      <div className="space-y-2">
        {pendingEth > 0n && (
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400">ETH</p><p className="font-bold text-green-400">{formatEthAmount(pendingEth)}</p></div>
            <Button size="sm" onClick={() => withdraw('eth')} loading={loading === 'eth'}>Withdraw ETH</Button>
          </div>
        )}
        {pendingUsdc > 0n && (
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400">USDC</p><p className="font-bold text-blue-400">{formatUsdcAmount(pendingUsdc)}</p></div>
            <Button size="sm" variant="secondary" onClick={() => withdraw('usdc')} loading={loading === 'usdc'}>Withdraw USDC</Button>
          </div>
        )}
      </div>
    </Card>
  )
}
