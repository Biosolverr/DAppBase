'use client'
import { useState } from 'react'
import { useWriteContract } from 'wagmi'
import toast from 'react-hot-toast'
import { Button, Badge, Modal, Input } from '@/components/ui'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { formatEthAmount, formatUsdcAmount, formatTimeLeft, SWAP_STATE_COLORS, SWAP_STATE_LABELS } from '@/lib/utils/crypto'

export function SwapCard({ swapId, swap, userAddress, onRefresh }: {
  swapId: `0x${string}`; swap: any; userAddress: `0x${string}`; onRefresh?: () => void
}) {
  const { writeContractAsync } = useWriteContract()
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<'fund' | 'complete' | 'claim' | 'refund' | 'cancel' | null>(null)
  const [secretInput, setSecretInput] = useState('')

  const state = swap.state as number
  const isInitiator = swap.initiator?.toLowerCase() === userAddress?.toLowerCase()
  const isCounterparty = swap.counterparty?.toLowerCase() === userAddress?.toLowerCase()
  const now = Math.floor(Date.now() / 1000)
  const timeLeftSec = Math.max(0, Number(swap.deadline) - now)
  const revealOpen = now <= Number(swap.revealDeadline) + 15

  const savedSecret = Object.keys(localStorage)
    .filter(k => k.startsWith('swap_pending_'))
    .map(k => { try { return JSON.parse(localStorage.getItem(k) || '{}') } catch { return {} } })
    .find(d => d.secret)?.secret || ''

  const tx = async (fn: () => Promise<any>, msg: string) => {
    setLoading(true)
    const tid = toast.loading(msg)
    try {
      await fn()
      toast.dismiss(tid)
      toast.success('Done!')
      setModal(null)
      onRefresh?.()
    } catch (e: any) {
      toast.dismiss(tid)
      toast.error(e.shortMessage || e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const wc = writeContractAsync as any

  return (
    <div className="rounded-2xl p-4 space-y-3 fade-up" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">{swapId.slice(0, 10)}...</span>
        <Badge label={SWAP_STATE_LABELS[state]} color={SWAP_STATE_COLORS[state]} />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">ETH</p>
          <p className="font-bold text-green-400">{formatEthAmount(swap.ethAmount)}</p>
        </div>
        <span className="text-gray-500">↔</span>
        <div className="flex-1 bg-[#0A0B0D] rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">USDC</p>
          <p className="font-bold text-blue-400">{formatUsdcAmount(swap.usdcAmount)}</p>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Role</span>
          <span className={isInitiator ? 'text-yellow-400' : isCounterparty ? 'text-blue-400' : 'text-gray-400'}>
            {isInitiator ? 'Initiator' : isCounterparty ? 'Counterparty' : 'Observer'}
          </span>
        </div>
        {state <= 2 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Time left</span>
            <span className={timeLeftSec < 3600 ? 'text-red-400' : 'text-white'}>{formatTimeLeft(timeLeftSec)}</span>
          </div>
        )}
        {state === 2 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Reveal window</span>
            <span className={revealOpen ? 'text-green-400' : 'text-red-400'}>{revealOpen ? 'Open' : 'Closed'}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {state === 1 && isCounterparty && (
          <Button size="sm" onClick={() => setModal('fund')} loading={loading}>Fund (USDC)</Button>
        )}
        {state === 2 && isInitiator && revealOpen && (
          <Button size="sm" onClick={() => setModal('complete')}>Complete</Button>
        )}
        {state === 2 && isCounterparty && revealOpen && (
          <Button size="sm" variant="secondary" onClick={() => setModal('claim')}>Claim</Button>
        )}
        {(state === 1 || state === 2) && (isInitiator || isCounterparty) && !revealOpen && (
          <Button size="sm" variant="danger" onClick={() => setModal('refund')}>Refund</Button>
        )}
        {state === 1 && isInitiator && timeLeftSec > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setModal('cancel')}>Cancel</Button>
        )}
      </div>

      {modal === 'fund' && (
        <Modal title="Fund Swap" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-400 mb-4">
            You will deposit <strong className="text-white">{formatUsdcAmount(BigInt(swap.usdcAmount) + BigInt(swap.bCollateral))} USDC</strong> (principal + 5% collateral).
          </p>
          <Button fullWidth onClick={() => tx(() => wc({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'fund', args: [swapId] }), 'Funding...')} loading={loading}>
            Confirm Fund
          </Button>
        </Modal>
      )}
      {modal === 'complete' && (
        <Modal title="Complete Swap" onClose={() => setModal(null)}>
          <Input label="Secret (bytes32)" value={secretInput || savedSecret} onChange={setSecretInput} placeholder="0x..." hint="Auto-filled if saved" />
          <div className="mt-3">
            <Button fullWidth onClick={() => tx(() => wc({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'complete', args: [swapId, (secretInput || savedSecret) as `0x${string}`] }), 'Completing...')} loading={loading}>
              Reveal and Complete
            </Button>
          </div>
        </Modal>
      )}
      {modal === 'claim' && (
        <Modal title="Claim Swap" onClose={() => setModal(null)}>
          <Input label="Secret (bytes32)" value={secretInput} onChange={setSecretInput} placeholder="0x..." />
          <div className="mt-3">
            <Button fullWidth onClick={() => tx(() => wc({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'claimAsCounterparty', args: [swapId, secretInput as `0x${string}`] }), 'Claiming...')} loading={loading}>
              Claim ETH
            </Button>
          </div>
        </Modal>
      )}
      {modal === 'refund' && (
        <Modal title="Refund Swap" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-400 mb-4">The swap expired. Reclaim your funds.</p>
          <Button fullWidth variant="danger" onClick={() => tx(() => wc({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'refund', args: [swapId] }), 'Refunding...')} loading={loading}>
            Confirm Refund
          </Button>
        </Modal>
      )}
      {modal === 'cancel' && (
        <Modal title="Cancel Swap" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-400 mb-4">Cancel before expiry. 2% premium will be burned.</p>
          <Button fullWidth variant="danger" onClick={() => tx(() => wc({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'cancel', args: [swapId] }), 'Cancelling...')} loading={loading}>
            Confirm Cancel
          </Button>
        </Modal>
      )}
    </div>
  )
}
