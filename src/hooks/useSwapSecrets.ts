'use client'

import { useState, useCallback } from 'react'

interface StoredSecret {
  swapId: string
  secret: `0x${string}`
  nonce: `0x${string}`
  createdAt: number
}

export function useSwapSecrets() {
  const [secrets, setSecrets] = useState<StoredSecret[]>(() => {
    // Только для восстановления после перезагрузки (минимально)
    try {
      const saved = sessionStorage.getItem('swap_secrets')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Очищаем старые (старше 7 дней)
        const now = Date.now()
        const fresh = parsed.filter((s: StoredSecret) => now - s.createdAt < 7 * 24 * 60 * 60 * 1000)
        return fresh
      }
    } catch { /* ignore */ }
    return []
  })

  const saveSecret = useCallback((swapId: string, secret: `0x${string}`, nonce: `0x${string}`) => {
    const newSecret = { swapId, secret, nonce, createdAt: Date.now() }
    setSecrets(prev => {
      const filtered = prev.filter(s => s.swapId !== swapId)
      const updated = [...filtered, newSecret]
      // Сохраняем в sessionStorage только как резервную копию
      try {
        sessionStorage.setItem('swap_secrets', JSON.stringify(updated))
      } catch { /* ignore */ }
      return updated
    })
    return newSecret
  }, [])

  const getSecret = useCallback((swapId: string) => {
    return secrets.find(s => s.swapId === swapId)
  }, [secrets])

  const clearSecret = useCallback((swapId: string) => {
    setSecrets(prev => {
      const updated = prev.filter(s => s.swapId !== swapId)
      try {
        sessionStorage.setItem('swap_secrets', JSON.stringify(updated))
      } catch { /* ignore */ }
      return updated
    })
  }, [])

  return { secrets, saveSecret, getSecret, clearSecret }
}
