export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`

export const SWAP_STATES = ['EMPTY', 'INITIATED', 'FUNDED', 'COMPLETED', 'REFUNDED', 'CANCELLED']

export const ABI = [
  { name: 'commitInitiate', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'commitment', type: 'bytes32' }], outputs: [] },
  { name: 'initiateFromCommit', type: 'function', stateMutability: 'payable',
    inputs: [
      { name: 'commitment', type: 'bytes32' }, { name: 'salt', type: 'bytes32' },
      { name: 'secretHash', type: 'bytes32' }, { name: 'nonce', type: 'bytes32' },
      { name: 'counterparty', type: 'address' }, { name: 'ethAmount', type: 'uint256' },
      { name: 'usdcAmount', type: 'uint256' }, { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ name: 'swapId', type: 'bytes32' }],
  },
  { name: 'fund', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
  { name: 'complete', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }, { name: 'secret', type: 'bytes32' }], outputs: [] },
  { name: 'claimAsCounterparty', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }, { name: 'secret', type: 'bytes32' }], outputs: [] },
  { name: 'refund', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
  { name: 'cancel', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'swapId', type: 'bytes32' }], outputs: [] },
  { name: 'withdrawEth', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'withdrawUsdc', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  {
    name: 'getSwap', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'swapId', type: 'bytes32' }],
    outputs: [{
      name: '', type: 'tuple',
      components: [
        { name: 'initiator', type: 'address' }, { name: 'counterparty', type: 'address' },
        { name: 'ethAmount', type: 'uint256' }, { name: 'usdcAmount', type: 'uint256' },
        { name: 'aCollateral', type: 'uint256' }, { name: 'bCollateral', type: 'uint256' },
        { name: 'aPremium', type: 'uint256' }, { name: 'createdAt', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }, { name: 'revealDeadline', type: 'uint256' },
        { name: 'secretHash', type: 'bytes32' }, { name: 'nonce', type: 'bytes32' },
        { name: 'secret', type: 'bytes32' }, { name: 'state', type: 'uint8' },
      ],
    }],
  },
  {
    name: 'getPendingWithdrawals', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'pendingEth', type: 'uint256' }, { name: 'pendingUsdc', type: 'uint256' }],
  },
  {
    name: 'getReputation', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'completed', type: 'uint64' }, { name: 'griefed', type: 'uint64' },
      { name: 'victimized', type: 'uint64' }, { name: 'cancelled', type: 'uint64' },
      { name: 'volumeGwei', type: 'uint128' }, { name: 'score', type: 'int256' },
    ],
  },
  {
    name: 'canInitiate', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'ok', type: 'bool' }, { name: 'reason', type: 'string' }],
  },
  {
    name: 'requiredEthDeposit', type: 'function', stateMutability: 'pure',
    inputs: [{ name: 'ethAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'requiredUsdcDeposit', type: 'function', stateMutability: 'pure',
    inputs: [{ name: 'usdcAmount', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'timeLeft', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'swapId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'revealWindowOpen', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'swapId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'isCollusionFlagActive', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }, { name: 'b', type: 'address' }],
    outputs: [{ name: 'active', type: 'bool' }, { name: 'expiryTime', type: 'uint256' }],
  },
  {
    name: 'getPairGriefCount', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'a', type: 'address' }, { name: 'b', type: 'address' }],
    outputs: [{ name: '', type: 'uint32' }],
  },
  {
    name: 'buildCommitment', type: 'function', stateMutability: 'pure',
    inputs: [
      { name: 'secretHash', type: 'bytes32' }, { name: 'nonce', type: 'bytes32' },
      { name: 'counterparty', type: 'address' }, { name: 'ethAmount', type: 'uint256' },
      { name: 'usdcAmount', type: 'uint256' }, { name: 'duration', type: 'uint256' },
      { name: 'initiator', type: 'address' }, { name: 'salt', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'buildSecretHash', type: 'function', stateMutability: 'pure',
    inputs: [{ name: 'secret', type: 'bytes32' }, { name: 'nonce', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bytes32' }],
  },
] as const
