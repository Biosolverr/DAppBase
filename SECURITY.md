# Security Policy

## Supported Versions

This frontend is maintained for the latest version only.

| Version | Supported |
|---|---|
| Latest (main) | ✅ |
| Older commits | ❌ |

## Scope

This repository contains only the **frontend** of SecureSwap. It does not contain smart contract code.

For smart contract security, see: [github.com/Biosolverr/BaseEthUsdcSwap/blob/main/SECURITY.md](https://github.com/Biosolverr/BaseEthUsdcSwap/blob/main/SECURITY.md)

## Frontend Security Notes

**Private keys are never handled by this app.**
All transaction signing is delegated to the user's wallet (Coinbase Smart Wallet, MetaMask, or other injected providers).

**Secrets are stored in localStorage.**
When a user initiates a swap, the generated `secret` is saved to `localStorage` under the key `swap_pending_<commitment>`. Users should be aware that:
- This is stored in the browser only
- Clearing browser data will delete the secret
- The secret is required to complete the swap — losing it means the swap will expire and be refunded after the deadline

**No backend.**
This is a fully static frontend. No user data is sent to any server. All interactions go directly to the Base blockchain via RPC.

**Environment variables.**
`NEXT_PUBLIC_*` variables are exposed to the browser by design (Next.js convention). Never put private keys or sensitive secrets in these variables.

## Reporting a Vulnerability

If you discover a security vulnerability in this frontend, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainer directly or open a private security advisory on GitHub
3. Include a description of the issue and steps to reproduce
4. Allow reasonable time for a fix before public disclosure

We take security seriously and will respond as quickly as possible.
