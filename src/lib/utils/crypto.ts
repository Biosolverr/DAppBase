import { keccak256, encodeAbiParameters, parseAbiParameters } from 'viem'

export function generateBytes32(): `0x${string}` {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return ('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')) as `0x${string}`
}

// Считаем локально через viem (идентично контракту)
export function buildSecretHash(secret: `0x${string}`, nonce: `0x${string}`): `0x${string}` {
  return keccak256(encodeAbiParameters(parseAbiParameters('bytes32, bytes32'), [secret, nonce]))
}

export function buildCommitment(params: {
  secretHash: `0x${string}`; nonce: `0x${string}`; counterparty: `0x${string}`
  ethAmount: bigint; usdcAmount: bigint; duration: bigint
  initiator: `0x${string}`; salt: `0x${string}`
}): `0x${string}` {
  return keccak256(encodeAbiParameters(
    parseAbiParameters('bytes32, bytes32, address, uint256, uint256, uint256, address, bytes32'),
    [params.secretHash, params.nonce, params.counterparty, params.ethAmount, params.usdcAmount, params.duration, params.initiator, params.salt]
  ))
}

export function formatEthAmount(wei: bigint): string {
  return (Number(wei) / 1e18).toFixed(6)
}

export function formatUsdcAmount(units: bigint): string {
  return (Number(units) / 1e6).toFixed(2)
}

export function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return 'Expired'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export const SWAP_STATE_LABELS: Record<number, string> = {
  0: 'Empty', 1: 'Initiated', 2: 'Funded', 3: 'Completed', 4: 'Refunded', 5: 'Cancelled',
}

export const SWAP_STATE_COLORS: Record<number, string> = {
  0: '#6B7280', 1: '#F59E0B', 2: '#3B82F6', 3: '#10B981', 4: '#8B5CF6', 5: '#EF4444',
}
