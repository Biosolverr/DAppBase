'use client'
import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther, parseUnits } from 'viem'
import toast from 'react-hot-toast'
import { Button, Card, Input } from '@/components/ui'
import { ABI, CONTRACT_ADDRESS } from '@/lib/abi/contract'
import { generateBytes32, buildSecretHash, buildCommitment } from '@/lib/utils/crypto'

export function InitiateSwap({ onSuccess }: { onSuccess?: () => void }) {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<'form' | 'initiate'>('form')
  const [loading, setLoading] = useState(false)
  const [ethAmt, setEthAmt] = useState('')
  const [usdcAmt, setUsdcAmt] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [duration, setDuration] = useState('3600')
  const [params, setParams] = useState<any>(null)

  const { data: canInit } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'canInitiate',
    args: [address!], query: { enabled: !!address },
  })

  const { data: requiredEth } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'requiredEthDeposit',
    args: [parseEther(ethAmt || '0')],
    query: { enabled: !!ethAmt && parseFloat(ethAmt) > 0 },
  })

  const handleCommit = async () => {
    if (!address) return toast.error('Connect wallet')
    if (!ethAmt || !usdcAmt) return toast.error('Fill ETH and USDC amounts')
    if (parseFloat(ethAmt) < 0.001) return toast.error('Min ETH: 0.001')
    if (parseFloat(usdcAmt) < 1) return toast.error('Min USDC: 1')
    setLoading(true)
    try {
      const secret = generateBytes32()
      const nonce = generateBytes32()
      const salt = generateBytes32()
      const secretHash = buildSecretHash(secret, nonce)
      const ethAmount = parseEther(ethAmt)
      const usdcAmount = parseUnits(usdcAmt, 6)
      const durationBig = BigInt(duration)
      const cp = (counterparty || '0x0000000000000000000000000000000000000000') as `0x${string}`
      const commitment = buildCommitment({ secretHash, nonce, counterparty: cp, ethAmount, usdcAmount, duration: durationBig, initiator: address, salt })
      const tid = toast.loading('Step 1/2: Submitting commitment...')
      await (writeContractAsync as any)({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'commitInitiate', args: [commitment], account: address })
      toast.dismiss(tid)
      toast.success('Commitment submitted!')
      localStorage.setItem(`swap_pending_${commitment}`, JSON.stringify({ secret, nonce, salt, secretHash, commitment }))
      setParams({ secret, nonce, salt, secretHash, commitment, ethAmt, usdcAmt, ethAmount, usdcAmount, durationBig, cp })
      setStep('initiate')
    } catch (e: any) {
      toast.error(e.shortMessage || e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleInitiate = async () => {
    if (!params || !requiredEth) return
    setLoading(true)
    try {
      const tid = toast.loading('Step 2/2: Initiating swap...')
      await (writeContractAsync as any)({
        address: CONTRACT_ADDRESS, abi: ABI, functionName: 'initiateFromCommit',
        args: [params.commitment, params.salt, params.secretHash, params.nonce, params.cp, params.ethAmount, params.usdcAmount, params.durationBig],
        value: requiredEth as bigint,
        account: address,
      })
      toast.dismiss(tid)
      toast.success('Swap initiated!')
      onSuccess?.()
    } catch (e: any) {
      toast.error(e.shortMessage || e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const durationOptions = [
    { label: '1h', value: '3600' },
    { label: '6h', value: '21600' },
    { label: '24h', value: '86400' },
    { label: '7d', value: '604800' },
  ]

  if (step === 'initiate' && params) {
    return (
      <Card>
        <h3 className="font-bold mb-1">Step 2: Initiate Swap</h3>
        <p className="text-xs text-gray-400 mb-4">Commitment submitted. Now lock your ETH.</p>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <p className="text-xs text-yellow-300 font-medium mb-1">Save your secret!</p>
          <p className="text-xs text-gray-400 font-mono break-all">{params.secret}</p>
          <p className="text-xs text-gray-500 mt-1">Saved in browser storage automatically.</p>
        </div>
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">ETH</span><span>{params.ethAmt} ETH</span></div>
          <div className="flex justify-between"><span className="text-gray-400">USDC</span><span>{params.usdcAmt} USDC</span></div>
          {requiredEth && (
            <div className="flex justify-between">
              <span className="text-gray-400">Total to send</span>
              <span className="text-yellow-400">{(Number(requiredEth) / 1e18).toFixed(6)} ETH</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep('form')} size="sm">Back</Button>
          <Button onClick={handleInitiate} loading={loading} fullWidth>Initiate and Lock ETH</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="font-bold mb-4">Initiate Swap</h3>
      <div className="space-y-3">
        <Input label="ETH Amount (you send)" value={ethAmt} onChange={setEthAmt} placeholder="0.01" type="number" suffix="ETH" hint="Min 0.001 ETH" />
        <Input label="USDC Amount (you receive)" value={usdcAmt} onChange={setUsdcAmt} placeholder="25" type="number" suffix="USDC" hint="Min 1 USDC" />
        <Input label="Counterparty (optional)" value={counterparty} onChange={setCounterparty} placeholder="0x... or leave empty" />
        <div>
          <label className="text-xs text-gray-400 font-medium block mb-1">Duration</label>
          <div className="grid grid-cols-4 gap-1">
            {durationOptions.map(o => (
              <button key={o.value} onClick={() => setDuration(o.value)}
                className="text-xs py-1.5 rounded-lg transition-colors"
                style={{ background: duration === o.value ? 'var(--accent)' : '#0A0B0D', color: duration === o.value ? '#fff' : '#6B7280', border: '1px solid var(--border)' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {requiredEth && parseFloat(ethAmt) > 0 && (
          <div className="flex justify-between text-sm py-2 px-3 rounded-lg" style={{ background: '#0A0B0D', border: '1px solid var(--border)' }}>
            <span className="text-gray-400">Required ETH</span>
            <span className="text-yellow-400 font-medium">{(Number(requiredEth) / 1e18).toFixed(6)}</span>
          </div>
        )}
        <Button onClick={handleCommit} loading={loading} fullWidth>Continue</Button>
      </div>
    </Card>
  )
}
