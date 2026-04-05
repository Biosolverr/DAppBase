'use client'
import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { Card, Input, Button } from '@/components/ui'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { formatTimeLeft } from '@/lib/utils/crypto'

export function CollusionCheck() {
  const [addrA, setAddrA] = useState('')
  const [addrB, setAddrB] = useState('')
  const [query, setQuery] = useState<{ a: `0x${string}`; b: `0x${string}` } | null>(null)

  const { data: collusionData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'isCollusionFlagActive',
    args: [query?.a!, query?.b!],
    query: { enabled: !!query },
  })

  const { data: griefCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getPairGriefCount' as any,
    args: [query?.a!, query?.b!],
    query: { enabled: !!query },
  })

  const isActive = collusionData ? (collusionData as any)[0] : false
  const expiryTime = collusionData ? (collusionData as any)[1] : 0n
  const count = griefCount ? Number(griefCount) : 0

  const secondsLeft = isActive ? Math.max(0, Number(expiryTime) - Math.floor(Date.now() / 1000)) : 0

  const handleCheck = () => {
    if (!addrA || !addrB) return
    setQuery({ a: addrA as `0x${string}`, b: addrB as `0x${string}` })
  }

  return (
    <Card>
      <h3 className="font-bold text-sm mb-3">Collusion Check</h3>
      <div className="space-y-2 mb-3">
        <Input
          label="Address A"
          value={addrA}
          onChange={setAddrA}
          placeholder="0x..."
        />
        <Input
          label="Address B"
          value={addrB}
          onChange={setAddrB}
          placeholder="0x..."
        />
      </div>
      <Button fullWidth size="sm" onClick={handleCheck}>Check Pair</Button>

      {query && collusionData && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Grief count</span>
            <span className={count >= 2 ? 'text-red-400 font-bold' : 'text-white'}>{count} / 2</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Collusion flag</span>
            <span className={isActive ? 'text-red-400 font-bold' : 'text-green-400'}>
              {isActive ? '🚨 ACTIVE' : '✅ Clean'}
            </span>
          </div>
          {isActive && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Expires in</span>
              <span className="text-yellow-400">{formatTimeLeft(secondsLeft)}</span>
            </div>
          )}
          <div className={`rounded-xl p-3 text-xs text-center mt-2 ${isActive ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-green-500/10 text-green-400 border border-green-500/30'}`}>
            {isActive
              ? 'This pair is flagged for collusion. Swaps between them are blocked.'
              : 'No collusion flag between these addresses.'}
          </div>
        </div>
      )}
    </Card>
  )
}
