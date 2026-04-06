'use client'
import { useReadContract } from 'wagmi'
import { Card } from '@/components/ui'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'

export function ReputationCard({ address }: { address: `0x${string}` }) {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'getReputation',
    args: [address], query: { enabled: !!address },
  })

  if (!data) return null

  const result = data as unknown as any[]
  const completed = Number(result[0])
  const griefed = Number(result[1])
  const victimized = Number(result[2])
  const cancelled = Number(result[3])
  const volumeGwei = Number(result[4])
  const score = Number(result[5])

  return (
    <Card>
      <h3 className="font-bold text-sm mb-3">Reputation</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Score</p>
          <p className={`text-xl font-bold ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>{score}</p>
        </div>
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-xl font-bold text-green-400">{completed}</p>
        </div>
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Griefed</p>
          <p className="text-xl font-bold text-red-400">{griefed}</p>
        </div>
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Cancelled</p>
          <p className="text-xl font-bold text-yellow-400">{cancelled}</p>
        </div>
      </div>
      <div className="mt-2 bg-[#0A0B0D] rounded-xl p-3">
        <p className="text-xs text-gray-400">Volume</p>
        <p className="font-bold">{volumeGwei.toLocaleString()} Gwei</p>
      </div>
    </Card>
  )
}
