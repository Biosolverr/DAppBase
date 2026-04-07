# Security Policy

## Supported Versions

This frontend is maintained for the latest version only.

| Version | Supported |
|---------|-----------|
| Latest (main) | ✅ |
| Older commits | ❌ |

## Scope

This repository contains the **frontend** of SecureSwap — a DApp for trustless atomic swaps between ETH and USDC on the Base blockchain.

**Smart contract security** is maintained in a separate repository. For contract audits and security details, please refer to the official contract repository.

## Frontend Security Architecture

### Private Keys
- Private keys are **never handled** by this application
- All transaction signing is delegated to the user's wallet:
  - Base Account (Coinbase Smart Wallet)
  - Coinbase Wallet
  - MetaMask
  - WalletConnect

### Secret Management

When a user initiates a swap:
1. A random `secret` (32 bytes) is generated locally using `crypto.getRandomValues()`
2. The secret is **temporarily stored in memory** (React state) during the session
3. For recovery after page refresh, the secret is stored in **sessionStorage** (not localStorage)
4. The secret is **never sent to any server** — only its hash is submitted to the blockchain

⚠️ **Important security notes:**
- Secrets are stored in `sessionStorage` (cleared when browser tab closes)
- Clearing browser data or closing the tab will permanently delete the secret
- **Losing the secret means the swap cannot be completed** — funds will only be recoverable via refund after the deadline expires
- For high-value swaps, users are strongly advised to **backup their secret manually**

### No Backend

This is a **fully static frontend**:
- No user data is sent to any server
- No analytics tracking (unless explicitly enabled by the user)
- All blockchain interactions go directly to the Base network via RPC endpoints
- Environment variables with `NEXT_PUBLIC_` prefix are exposed to the browser by design (Next.js convention)

### Wallet Connection

The application supports multiple wallets:
- **Base Account** — native smart wallet on Base (recommended)
- **Coinbase Wallet** — via direct extension injection
- **MetaMask** — via direct `window.ethereum` request
- **WalletConnect** — via QR code scanning

All wallet connections are handled through the **Wagmi** library and **Base Account SDK**.

### Network Protection

- The application **only works on Base Mainnet**
- A network warning banner appears if the user is on the wrong network
- Users can switch networks with a single click

### Rate Limits & Cooldowns

Built-in protections from the smart contract:
- `INITIATE_COOLDOWN` (2 minutes) — prevents spam creation
- `FUND_COOLDOWN` (1 minute) — prevents rapid funding
- `MAX_ACTIVE_PER_USER` (5 swaps) — limits active swap exposure

## Reporting a Vulnerability

If you discover a security vulnerability in this frontend, please report it responsibly:

1. **Do NOT open a public GitHub issue**
2. Email the maintainer directly or open a **private security advisory** on GitHub
3. Include:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
4. Allow reasonable time for a fix before public disclosure

We take security seriously and will respond as quickly as possible.

## Known Limitations

- Secrets stored in `sessionStorage` — **not suitable for high-value swaps without manual backup**
- No hardware wallet support for Base Account (coming soon)
- Collusion check UI is minimal (basic address pair input)

## Responsible Disclosure

We appreciate responsible disclosure of any security issues. Valid reports may be eligible for a bounty (at maintainer's discretion).

---

**SecureSwap — Trustless. Atomic. On Base.**
