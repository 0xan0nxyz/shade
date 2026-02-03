# SHADE

<p align="center">
  <img src="logo.png" alt="SHADE Logo" width="200"/>
</p>

<p align="center">
  <strong>Privacy Wallet for Solana</strong>
</p>

<p align="center">
  Burner Wallets • Stealth Addresses • Military-Grade Encryption
</p>

---

## What Is SHADE?

Most crypto wallets expose everything—your balance, transactions, and everyone you transact with. **SHADE is different.**

SHADE is a privacy-first wallet for Solana that lets you:

- **Create burner wallets** — Use once, destroy forever. No trace.
- **Generate stealth addresses** — One-time addresses that can't be linked
- **Login with biometrics** — No seed phrase to lose or steal
- **Pay fees from hidden wallets** — Your main wallet stays invisible
- **Encrypt everything locally** — Zero server trust

---

## Why Privacy Matters

Your financial transactions are your business. Not your employer's. Not your competitors'. Not anyone watching the blockchain.

SHADE gives you the privacy that traditional finance takes for granted—in the crypto world.

---

## Features

| Feature | Description |
|---------|-------------|
| **Burner Wallets** | Disposable wallets you can create, use, and destroy |
| **Stealth Addresses** | One-time receive addresses that can't be linked |
| **Passkey Login** | Biometric authentication, no seed phrase |
| **Gasless Transactions** | Pay fees from a separate wallet |
| **Military Encryption** | AES-256-GCM, 310k PBKDF2 iterations |
| **Self-Destruct** | Auto-wipes if tampering detected |

---

## Quick Comparison

| Capability | Regular Wallet | SHADE |
|------------|----------------|-------|
| Create wallet | ✅ | ✅ |
| Send/receive crypto | ✅ | ✅ |
| Disposable wallets | ❌ | ✅ |
| Untraceable payments | ❌ | ✅ |
| Biometric login | ❌ | ✅ |
| Hidden fee payer | ❌ | ✅ |
| Tamper protection | ❌ | ✅ |

---

## Security

| Component | Standard |
|-----------|----------|
| Encryption | AES-256-GCM |
| Key Derivation | PBKDF2 (310,000 iterations) |
| Hashing | SHA-512 |
| Auth | WebAuthn / Passkeys |
| Compliance | OWASP 2025 |

All cryptography runs **locally in your browser** using the Web Crypto API. Nothing is ever sent to any server.

---

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run tests
bun test

# Build for production
bun run build
```

Visit `http://localhost:3000` to access the wallet.

---

## Documentation

- [**Overview**](docs/OVERVIEW.md) — Full feature walkthrough
- [**Whitepaper**](docs/WHITEPAPER.md) — Technical deep-dive
- [**Pitch**](docs/PITCH.md) — Quick summary

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 19, TypeScript |
| Styling | Tailwind CSS, Radix UI |
| Blockchain | Solana Web3.js |
| Crypto | Web Crypto API |
| Testing | Vitest |

---

## Roadmap

- [x] Burner wallet system
- [x] Stealth address generation
- [x] Passkey authentication
- [x] Gasless transactions
- [x] Military-grade encryption
- [ ] Mixer integration
- [ ] Hardware wallet support
- [ ] Mobile app
- [ ] Zero-knowledge proofs

---

## License

MIT License — Open source, free to use and modify.

---

<p align="center">
  <strong>SHADE — Your keys. Your coins. Your privacy.</strong>
</p>
