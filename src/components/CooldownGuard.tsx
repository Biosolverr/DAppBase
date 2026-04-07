'use client'

import { useReadContract } from 'wagmi'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { useEffect, useState } from 'react'

interface CooldownGuardProps {
  userAddress: `0x${string}`
  action: 'initiate' | 'fund'
  children: (props: { isBlocked: boolean; remainingSeconds: number; reason: string }) => React.ReactNode
}

export function CooldownGuard({ userAddress, action, children }: CooldownGuardProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [reason, setReason] = useState('')

  const { data: canInitiate } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'canInitiate',
    args: [userAddress],
    query: { enabled: action === 'initiate' && !!userAddress },
  })

  const { data: rateLimit } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'rateLimit',
    args: [userAddress],
    query: { enabled: action === 'fund' && !!userAddress },
  })

  useEffect(() => {
    if (action === 'initiate' && canInitiate) {
      const [ok, msg] = canInitiate as [boolean, string]
      setIsBlocked(!ok)
      setReason(msg)
      
      if (!ok && msg.includes('cooldown')) {
        // Пытаемся извлечь оставшееся время из сообщения
        const match = msg.match(/\d+/)
        if (match) setRemainingSeconds(parseInt(match[0]))
      }
    }
  }, [canInitiate, action])

  useEffect(() => {
    if (action === 'fund' && rateLimit) {
      const rl = rateLimit as { lastFundedAt: bigint; activeCount: number }
      const now = BigInt(Math.floor(Date.now() / 1000))
      const cooldownEnd = rl.lastFundedAt + 60n // FUND_COOLDOWN = 1 minute
      
      if (now < cooldownEnd) {
        setIsBlocked(true)
        setRemainingSeconds(Number(cooldownEnd - now))
        setReason(`Fund cooldown active. Wait ${remainingSeconds} seconds.`)
      } else if (rl.activeCount >= 5) {
        setIsBlocked(true)
        setReason('Too many active swaps. Complete or cancel some first.')
      } else {
        setIsBlocked(false)
        setReason('')
      }
    }
  }, [rateLimit, action, remainingSeconds])

  return <>{children({ isBlocked, remainingSeconds, reason })}</>
}
