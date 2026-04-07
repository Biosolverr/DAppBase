'use client'

import { useNetworkCheck } from '@/hooks/useNetworkCheck'

export function NetworkWarning() {
  const { isWrongNetwork, switchToBase, isSwitching } = useNetworkCheck()

  if (!isWrongNetwork) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-3 text-center">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
        <span className="text-sm">
          ⚠️ Wrong network! Please switch to Base Mainnet.
        </span>
        <button
          onClick={switchToBase}
          disabled={isSwitching}
          className="bg-white text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {isSwitching ? 'Switching...' : 'Switch to Base'}
        </button>
      </div>
    </div>
  )
}
