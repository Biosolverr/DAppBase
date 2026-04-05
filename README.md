# SecureSwap — ETH ↔ USDC Mobile DApp

Mobile-first frontend for the `SecureEthUsdcSwap v9.0` trustless atomic swap contract on Base.

## Overview

SecureSwap allows two parties to exchange ETH and USDC without a trusted intermediary. Built on top of Base Smart Wallet via OnchainKit, it provides a seamless mobile experience with sub-account support and gasless transactions.

## Features

- 🔐 **Base Smart Wallet** — connect via Coinbase Smart Wallet with sub-accounts
- ⚡ **Full swap lifecycle** — commit → initiate → fund → complete
- 🛡️ **MEV protection** — commit-reveal scheme built into the UI
- 💰 **Pull-payment withdrawals** — ETH and USDC withdrawn separately
- 📊 **On-chain reputation** — score, completed swaps, grief history
- 🚨 **Collusion detection** — check pair grief count and flag status
- 📱 **Mobile-first UI** — optimized for iOS and Android browsers

## Contract Functions Covered

| Function | UI Location |
|---|---|
| `commitInitiate` | Initiate flow — Step 1 |
| `initiateFromCommit` | Initiate flow — Step 2 |
| `fund` | SwapCard → Fund button |
| `complete` | SwapCard → Complete button |
| `claimAsCounterparty` | SwapCard → Claim button |
| `refund` | SwapCard → Refund button |
| `cancel` | SwapCard → Cancel button |
| `withdrawEth` | Withdraw panel |
| `withdrawUsdc` | Withdraw panel |
| `getSwap` | Swap lookup by ID |
| `getReputation` | Reputation tab |
| `getPendingWithdrawals` | Withdraw panel |
| `canInitiate` | Initiate form validation |
| `requiredEthDeposit` | Initiate form calculation |
| `isCollusionFlagActive` | Collusion check tab |
| `getPairGriefCount` | Collusion check tab |

## Stack

- **Next.js 14** — App Router
- **OnchainKit** — Base Smart Wallet provider
- **wagmi v2 + viem v2** — contract interactions
- **TanStack Query** — data fetching
- **Tailwind CSS** — styling

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/Biosolverr/MobDapp.git
cd MobDapp
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure environment

Create `.env.local`:
```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_coinbase_developer_platform_api_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_CHAIN=base
```

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` — get from [developer.coinbase.com](https://developer.coinbase.com)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` — your deployed `SecureEthUsdcSwap` contract address
- `NEXT_PUBLIC_CHAIN` — `base` for mainnet, `baseSepolia` for testnet

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Add environment variables in Vercel dashboard
3. Set Install Command: `npm install --legacy-peer-deps`
4. Deploy

## Smart Contract

The frontend connects to `SecureEthUsdcSwap v9.0`.

- **Contract repo:** [github.com/Biosolverr/BaseEthUsdcSwap](https://github.com/Biosolverr/BaseEthUsdcSwap)
- **Network:** Base Mainnet / Base Sepolia
- **USDC (Base mainnet):** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **USDC (Base Sepolia):** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## License

MIT
