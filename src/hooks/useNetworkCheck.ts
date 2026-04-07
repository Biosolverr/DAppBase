'use client'

import { useAccount, useSwitchChain } from 'wagmi'
import { base } from 'wagmi/chains'
import { useEffect, useState } from 'react'

export function useNetworkCheck() {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    if (chain) {
      setIsWrongNetwork(chain.id !== base.id)
    }
  }, [chain])

  const switchToBase = async () => {
    setIsSwitching(true)
    try {
      await switchChain({ chainId: base.id })
    } catch (error) {
      console.error('Failed to switch network:', error)
    } finally {
      setIsSwitching(false)
    }
  }

  return { isWrongNetwork, switchToBase, isSwitching, currentChainId: chain?.id }
}
