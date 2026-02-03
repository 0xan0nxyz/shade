# SHADE Protocol
## Technical Whitepaper v1.0

### Abstract

SHADE is a privacy layer for Solana that implements burner wallets, stealth addresses, and cryptographic isolation to enable untraceable transactions. This document describes the technical architecture, cryptographic primitives, and security model.

---

## 1. Introduction

### 1.1 The Privacy Problem

Public blockchains like Solana provide transparency but sacrifice privacy. Every transaction reveals:
- Sender address
- Recipient address
- Amount transferred
- Historical balances
- Transaction patterns

This creates a surveillance economy where on-chain analysis can:
- Track individual spending habits
- Link addresses to real identities
- Enable targeted attacks on high-value wallets
- Allow competitors to analyze business activity

### 1.2 Design Goals

SHADE addresses these concerns with four objectives:
1. **Unlinkability** — Transactions cannot be traced to the same user
2. **Zero Trust** — No server ever sees private keys
3. **Usability** — Privacy without complexity
4. **Compatibility** — Works with existing Solana infrastructure

---

## 2. Cryptographic Primitives

### 2.1 Encryption Standard

SHADE uses AES-256-GCM (Galois/Counter Mode) for all encryption:

```
ciphertext = AES-GCM(plaintext, key, iv, aad)
```

**Parameters:**
- Key size: 256 bits
- IV size: 96 bits (random per encryption)
- Authentication tag: 128 bits

**Properties:**
- Authenticated encryption (confidentiality + integrity)
- Parallelizable for performance
- NIST-approved, widely deployed

### 2.2 Key Derivation

Keys are derived using PBKDF2-HMAC-SHA256:

```
derived_key = PBKDF2(password, salt, iterations, key_length)
```

**Parameters:**
- Iterations: 310,000 (OWASP 2025 recommendation)
- Salt: 256 bits (random per derivation)
- Output key: 256 bits

**Rationale:**
Higher iteration counts increase brute-force resistance. At 310k iterations:
- ~0.3 seconds per attempt on modern hardware
- ~9.5 years for 1 billion attempts
- Significantly slower on GPUs due to memory-hard properties

### 2.3 Hashing

SHA-512 for integrity verification:

```
checksum = SHA-512(encrypted_data)
```

HMAC-SHA-256 for authenticated message codes:

```
mac = HMAC-SHA-256(key, message)
```

---

## 3. Burner Wallet System

### 3.1 Overview

Burner wallets are disposable Solana keypairs that can be created, used, and destroyed without linking to a primary identity.

### 3.2 Generation

```typescript
function createBurner():
    1. keypair = Keypair.generate()  // Ed25519
    2. id = SHA-256(keypair.publicKey)[:8]  // Unique ID
    3. encrypted_secret = encrypt(keypair.secretKey, password)
    4. store(id, encrypted_secret, publicKey)
    return { id, publicKey }
```

### 3.3 Lifecycle

```
┌──────────────┐
│   CREATE     │ Generate keypair, encrypt, store
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   ACTIVE     │ Receive/send transactions
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   SWEEP      │ Transfer all funds out
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   DESTROY    │ Cryptographic erasure of keys
└──────────────┘
```

### 3.4 Security Properties

- **Forward Secrecy**: Destroying a burner eliminates future compromise risk
- **Isolation**: Each burner has independent keys
- **Unlinkability**: No on-chain connection between burners

---

## 4. Stealth Address Protocol

### 4.1 Overview

Stealth addresses enable a recipient to receive payments at unique addresses without revealing their identity to observers.

### 4.2 Key Hierarchy

```
Master Seed (256 bits)
    │
    ├── Scan Key (viewing)
    │
    └── Spend Key (spending)
```

### 4.3 Address Generation

**Sender side:**
```
1. recipient_meta = scan_pubkey || spend_pubkey
2. ephemeral_keypair = generate_keypair()
3. shared_secret = ECDH(ephemeral_secret, scan_pubkey)
4. stealth_pubkey = spend_pubkey + H(shared_secret) * G
5. publish: { ephemeral_pubkey, stealth_pubkey }
```

**Recipient side:**
```
1. shared_secret = ECDH(scan_secret, ephemeral_pubkey)
2. stealth_secret = spend_secret + H(shared_secret)
3. verify: stealth_secret * G == stealth_pubkey
```

### 4.4 Scanning

Recipients periodically scan the chain for payments:
```
for each (ephemeral_pubkey, stealth_pubkey) in announcements:
    shared_secret = ECDH(scan_secret, ephemeral_pubkey)
    expected_pubkey = spend_pubkey + H(shared_secret) * G
    if expected_pubkey == stealth_pubkey:
        payment_found()
```

### 4.5 Current Implementation

SHADE v1 uses a simplified deterministic model:
- Addresses derived from master seed + index
- Each index produces unique keypair
- Addresses marked spent after sweeping

Future versions will implement full ECDH-based protocol.

---

## 5. Passkey Wallet (WebAuthn)

### 5.1 Overview

WebAuthn enables passwordless authentication using device biometrics or hardware security keys.

### 5.2 Flow

```
┌───────────────────────────────────────────────────────────┐
│                    WALLET CREATION                        │
├───────────────────────────────────────────────────────────┤
│  1. User triggers biometric prompt                        │
│  2. Device creates credential in secure enclave           │
│  3. Public key registered, private key never leaves device│
│  4. Solana keypair derived from WebAuthn credential       │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                         │
├───────────────────────────────────────────────────────────┤
│  1. Challenge sent to authenticator                       │
│  2. User verifies with biometric                          │
│  3. Authenticator signs challenge                         │
│  4. Server verifies signature                             │
│  5. Wallet access granted                                 │
└───────────────────────────────────────────────────────────┘
```

### 5.3 Derivation Path

Standard Solana BIP-44 path:
```
m/44'/501'/0'/0'
     │    │   │  └── Address index
     │    │   └───── Change (external)
     │    └──────── Account
     └─────────── Solana coin type
```

### 5.4 Security Benefits

- **Phishing-proof**: Credentials bound to origin
- **No seed phrase**: Eliminates written backup risk
- **Hardware-backed**: Keys in secure element
- **Biometric**: Requires physical presence

---

## 6. Gasless Transactions

### 6.1 Problem

Standard Solana transactions require the sender to pay fees in SOL. This reveals the sender's main wallet.

### 6.2 Solution

Separate the transaction signer from the fee payer:

```
Transaction {
    signatures: [
        main_wallet.sign(message),    // Signs the intent
        fee_payer.sign(message)       // Pays the fee
    ],
    fee_payer: fee_payer.publicKey,
    instructions: [...]
}
```

### 6.3 Implementation

```typescript
async function sendWithFeePayer(tx, mainKeypair, feePayerKeypair):
    tx.feePayer = feePayerKeypair.publicKey
    tx.recentBlockhash = await getBlockhash()
    tx.sign(mainKeypair, feePayerKeypair)  // Both sign
    return await sendTransaction(tx)
```

### 6.4 Privacy Gain

- Main wallet doesn't appear as fee payer
- Fee payer can be a burner (destroyed after)
- Observers see fee payer, not actual sender

---

## 7. Storage Architecture

### 7.1 SecureKeyManager

Centralized encrypted storage using IndexedDB:

```
┌─────────────────────────────────────────────┐
│              SecureKeyManager               │
├─────────────────────────────────────────────┤
│  Purpose-based key isolation:               │
│                                             │
│  burner:{id}      → encrypted burner key    │
│  stealth:master   → encrypted master seed   │
│  stealth:{idx}    → encrypted spend key     │
│  gasless:{id}     → encrypted fee payer key │
│  passkey:{id}     → encrypted passkey data  │
└─────────────────────────────────────────────┘
```

### 7.2 Encryption Pipeline

```
plaintext
    │
    ▼
┌───────────────┐
│ PBKDF2        │ password + salt → derived_key
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ AES-256-GCM   │ plaintext + derived_key + iv → ciphertext
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ SHA-512       │ ciphertext → checksum
└───────┬───────┘
        │
        ▼
{ iv, salt, ciphertext, checksum }
```

### 7.3 Legacy Migration

Automatic upgrade from old encryption format:
```typescript
async function getData(key, password):
    data = await storage.get(key)
    if (isLegacyFormat(data)):
        decrypted = legacyDecrypt(data, password)
        upgraded = newEncrypt(decrypted, password)
        await storage.set(key, upgraded)
        return decrypted
    return newDecrypt(data, password)
```

---

## 8. Threat Model

### 8.1 Threats Addressed

| Threat | Mitigation |
|--------|------------|
| Key theft via malware | Encrypted storage, session timeout |
| Blockchain surveillance | Burners, stealth addresses |
| Phishing | WebAuthn origin binding |
| Brute force | 310k PBKDF2 iterations |
| Memory dumps | Minimal key exposure time |
| Code tampering | Integrity checks, self-destruct |

### 8.2 Threats Not Addressed

| Threat | Status |
|--------|--------|
| Compromised device OS | Out of scope |
| Physical coercion | Out of scope |
| Advanced nation-state | Partial (best effort) |
| Quantum computing | Future: post-quantum crypto |

### 8.3 Security Monitor

Active threat detection:
```typescript
class SecurityMonitor {
    detectDebugger()     // Check for active debugger
    detectDevTools()     // Monitor for DevTools opening
    detectTampering()    // Verify code integrity
    onThreatDetected()   // Trigger self-destruct
}
```

---

## 9. Performance

### 9.1 Benchmarks

| Operation | Time |
|-----------|------|
| Create burner | ~50ms |
| Encrypt key | ~300ms |
| Decrypt key | ~300ms |
| Generate stealth address | ~100ms |
| WebAuthn authentication | ~500ms |
| Transaction signing | ~10ms |

### 9.2 Scalability

- Storage: Limited by browser IndexedDB (typically 50MB+)
- Burners: No practical limit
- Stealth addresses: No practical limit

---

## 10. Future Work

### 10.1 Short Term
- Transaction mixing integration
- Multi-signature stealth addresses
- Hardware wallet support (Ledger, Trezor)

### 10.2 Medium Term
- Zero-knowledge balance proofs
- Private DeFi swaps (ZK-based)
- Cross-chain stealth bridges

### 10.3 Long Term
- Post-quantum cryptography migration
- Fully homomorphic computation
- Decentralized scanning infrastructure

---

## 11. Conclusion

SHADE provides practical privacy for Solana users through:
1. **Burner wallets** — disposable, unlinkable addresses
2. **Stealth addresses** — one-time receive addresses
3. **Passkeys** — seedless, phishing-proof authentication
4. **Gasless transactions** — hidden fee payers

The system operates entirely client-side with zero server trust, using industry-standard cryptography (AES-256-GCM, PBKDF2, SHA-512).

Privacy is not about hiding wrongdoing—it's about financial autonomy. SHADE gives that choice back to users.

---

## References

1. NIST SP 800-38D: Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)
2. OWASP Password Storage Cheat Sheet (2025)
3. BIP-44: Multi-Account Hierarchy for Deterministic Wallets
4. WebAuthn Level 2 Specification (W3C)
5. Solana Documentation: Runtime, Transactions, Programs

---

*SHADE Protocol — Privacy for Solana*
