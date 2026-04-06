export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`

export const SWAP_STATES = ['EMPTY', 'INITIATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'CANCELLED']

export const ABI = [
  { name: 'getSwap', type: 'function', stateMutability: 'view', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [{ name: '', type: 'tuple', components: [] }] },
  { name: 'getReputation', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [] },
  { name: 'isCollusionFlagActive', type: 'function', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }, { name: 'b', type: 'address' }], outputs: [] },
] as const
