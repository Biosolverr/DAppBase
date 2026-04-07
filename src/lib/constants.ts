export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`

export const SWAP_STATES = ['EMPTY', 'INITIATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'CANCELLED']

export const ABI = [
  { name: 'initiateFromCommit', type: 'function', stateMutability: 'payable', inputs: [{ name: 'commitment', type: 'bytes32' }, { name: 'salt', type: 'bytes32' }, { name: 'secretHash', type: 'bytes32' }, { name: 'nonce', type: 'bytes32' }, { name: 'counterparty', type: 'address' }, { name: 'ethAmount', type: 'uint256' }, { name: 'usdcAmount', type: 'uint256' }, { name: 'duration', type: 'uint256' }], outputs: [] },
  { name: 'fund', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
  { name: 'complete', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }, { name: 'secret', type: 'bytes32' }], outputs: [] },
  { name: 'withdrawEth', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'withdrawUsdc', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getSwap', type: 'function', stateMutability: 'view', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
  { name: 'getReputation', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [] },
  { name: 'isCollusionFlagActive', type: 'function', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }, { name: 'b', type: 'address' }], outputs: [] },
  { name: 'getPairGriefCount', type: 'function', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }, { name: 'b', type: 'address' }], outputs: [] },
  { name: 'refund', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
  { name: 'cancel', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
] as const
