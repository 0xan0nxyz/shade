# Security - SHADE Wallet

## Simple Overview

SHADE uses encryption to protect your private keys and data. The same type of encryption banks use to protect their systems.

## Encryption Details

- **Algorithm:** AES-256-GCM (industry standard)
- **Key Derivation:** PBKDF2 with 310,000 iterations
- **Salt:** 32 bytes per encryption
- **IV:** 16 bytes per encryption

## What This Means

- Your private keys are encrypted before storage
- Each encryption uses a unique salt (so same password = different results)
- Brute force attacks are extremely impractical
- Even if someone accesses your device, they can't read your keys

## Security Features

- **Zero-knowledge proofs** - Prove you have funds without showing the amount
- **Stealth addresses** - Generate addresses that can't be traced
- **Session timeout** - Automatically locks after inactivity
- **Rate limiting** - Prevents spam attacks
- **Local storage only** - Nothing leaves your device

## Testing

73 tests verify:
- Encryption/decryption
- Key derivation
- Session security
- Wallet connection
- Blockchain integration

## Compliance

- No personal information collected
- No tracking or analytics
- No cookies for tracking
- GDPR-friendly by design

All processing happens in your browser.
