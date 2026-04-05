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
  const [completed, griefed, victimized, cancelled, volumeGwei, score] = data as any[]

  return (
    <Card>
      <h3 className="font-bold text-sm mb-3">Reputation</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Score</p>
          <p className={`text-xl font-bold ${Number(score) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(score)}</p>
        </div>
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Completed</p>
          <p className="text-xl font-bold text-green-400">{Number(completed)}</p>
        </div>
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Griefed</p>
          <p className="text-xl font-bold text-red-400">{Number(griefed)}</p>
        </div>
        <div className="bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400">Cancelled</p>
          <p className="text-xl font-bold text-yellow-400">{Number(cancelled)}</p>
        </div>
      </div>
      <div className="mt-2 bg-[#0A0B0D] rounded-xl p-3">
        <p className="text-xs text-gray-400">Volume</p>
        <p className="font-bold">{Number(volumeGwei).toLocaleString()} Gwei</p>
      </div>
    </Card>
  )
}
