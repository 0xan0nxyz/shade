'use client';

import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WhitepaperDocs() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <FileText className="w-4 h-4" />
          Technical Documentation
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">SHADE Protocol Whitepaper</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          A technical deep-dive into the cryptographic primitives, security model,
          and protocol design of SHADE.
        </p>
      </div>

      {/* Abstract */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Abstract</h2>
        <p className="text-muted-foreground">
          SHADE is a privacy layer for Solana that implements burner wallets, stealth addresses,
          and cryptographic isolation to enable untraceable transactions. This document describes
          the technical architecture, cryptographic primitives, and security model. The system
          operates entirely client-side with zero server trust, using industry-standard cryptography
          (AES-256-GCM, PBKDF2, SHA-512).
        </p>
      </section>

      {/* Table of Contents */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Contents</h2>
        <div className="space-y-2 text-muted-foreground">
          {[
            { num: '1', title: 'Introduction', sub: ['The Privacy Problem', 'Design Goals'] },
            { num: '2', title: 'Cryptographic Primitives', sub: ['Encryption Standard', 'Key Derivation', 'Hashing'] },
            { num: '3', title: 'Burner Wallet System', sub: ['Generation', 'Lifecycle', 'Security Properties'] },
            { num: '4', title: 'Stealth Address Protocol', sub: ['Key Hierarchy', 'Address Generation', 'Scanning'] },
            { num: '5', title: 'Passkey Wallet (WebAuthn)', sub: ['Flow', 'Derivation Path', 'Security Benefits'] },
            { num: '6', title: 'Gasless Transactions', sub: ['Problem', 'Solution', 'Implementation'] },
            { num: '7', title: 'Storage Architecture', sub: ['SecureKeyManager', 'Encryption Pipeline'] },
            { num: '8', title: 'Threat Model', sub: ['Threats Addressed', 'Out of Scope'] },
            { num: '9', title: 'Future Work', sub: ['Short Term', 'Medium Term', 'Long Term'] },
          ].map((section) => (
            <div key={section.num} className="border-b border-white/5 pb-2 last:border-0">
              <div className="font-medium">
                {section.num}. {section.title}
              </div>
              <div className="text-sm text-muted-foreground/60 ml-4">
                {section.sub.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 1: Introduction */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>

        <h3 className="text-lg font-semibold mb-2 mt-6">1.1 The Privacy Problem</h3>
        <p className="text-muted-foreground mb-4">
          Public blockchains like Solana provide transparency but sacrifice privacy. Every transaction reveals
          sender address, recipient address, amount transferred, historical balances, and transaction patterns.
          This creates a surveillance economy where on-chain analysis can track individual spending habits,
          link addresses to real identities, enable targeted attacks on high-value wallets, and allow
          competitors to analyze business activity.
        </p>

        <h3 className="text-lg font-semibold mb-2 mt-6">1.2 Design Goals</h3>
        <p className="text-muted-foreground mb-2">SHADE addresses these concerns with four objectives:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li><strong>Unlinkability</strong> — Transactions cannot be traced to the same user</li>
          <li><strong>Zero Trust</strong> — No server ever sees private keys</li>
          <li><strong>Usability</strong> — Privacy without complexity</li>
          <li><strong>Compatibility</strong> — Works with existing Solana infrastructure</li>
        </ul>
      </section>

      {/* Section 2: Cryptographic Primitives */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">2. Cryptographic Primitives</h2>

        <h3 className="text-lg font-semibold mb-2 mt-6">2.1 Encryption Standard</h3>
        <p className="text-muted-foreground mb-3">
          SHADE uses AES-256-GCM (Galois/Counter Mode) for all encryption:
        </p>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4 mb-4">
          <pre className="text-muted-foreground">
{`ciphertext = AES-GCM(plaintext, key, iv, aad)

Parameters:
- Key size: 256 bits
- IV size: 96 bits (random per encryption)
- Authentication tag: 128 bits`}
          </pre>
        </div>

        <h3 className="text-lg font-semibold mb-2 mt-6">2.2 Key Derivation</h3>
        <p className="text-muted-foreground mb-3">
          Keys are derived using PBKDF2-HMAC-SHA256:
        </p>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4 mb-4">
          <pre className="text-muted-foreground">
{`derived_key = PBKDF2(password, salt, iterations, key_length)

Parameters:
- Iterations: 310,000 (OWASP 2025 recommendation)
- Salt: 256 bits (random per derivation)
- Output key: 256 bits`}
          </pre>
        </div>
        <p className="text-muted-foreground">
          At 310k iterations: ~0.3 seconds per attempt on modern hardware, ~9.5 years for 1 billion attempts.
        </p>
      </section>

      {/* Section 3: Burner Wallet System */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">3. Burner Wallet System</h2>

        <h3 className="text-lg font-semibold mb-2 mt-6">3.1 Generation</h3>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4 mb-4">
          <pre className="text-muted-foreground">
{`function createBurner():
    keypair = Keypair.generate()  // Ed25519
    id = SHA-256(keypair.publicKey)[:8]
    encrypted_secret = encrypt(keypair.secretKey, password)
    store(id, encrypted_secret, publicKey)
    return { id, publicKey }`}
          </pre>
        </div>

        <h3 className="text-lg font-semibold mb-2 mt-6">3.2 Security Properties</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li><strong>Forward Secrecy</strong> — Destroying a burner eliminates future compromise risk</li>
          <li><strong>Isolation</strong> — Each burner has independent keys</li>
          <li><strong>Unlinkability</strong> — No on-chain connection between burners</li>
        </ul>
      </section>

      {/* Section 4: Stealth Addresses */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">4. Stealth Address Protocol</h2>

        <h3 className="text-lg font-semibold mb-2 mt-6">4.1 Key Hierarchy</h3>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4 mb-4">
          <pre className="text-muted-foreground">
{`Master Seed (256 bits)
    │
    ├── Scan Key (viewing)
    │
    └── Spend Key (spending)`}
          </pre>
        </div>

        <h3 className="text-lg font-semibold mb-2 mt-6">4.2 Address Generation</h3>
        <p className="text-muted-foreground mb-3">
          SHADE v1 uses a simplified deterministic model. Each index produces a unique keypair
          that cannot be linked to others:
        </p>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
          <pre className="text-muted-foreground">
{`stealth_address_0 = derive(seed, 0).publicKey
stealth_address_1 = derive(seed, 1).publicKey
// ... unlinkable to each other`}
          </pre>
        </div>
      </section>

      {/* Section 5-9 Summary */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Additional Sections</h2>
        <p className="text-muted-foreground mb-4">
          The complete whitepaper includes detailed coverage of:
        </p>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li><strong>Section 5:</strong> Passkey Wallet implementation using WebAuthn and secure enclaves</li>
          <li><strong>Section 6:</strong> Gasless transaction protocol and fee payer separation</li>
          <li><strong>Section 7:</strong> Storage architecture with SecureKeyManager and IndexedDB</li>
          <li><strong>Section 8:</strong> Comprehensive threat model and security analysis</li>
          <li><strong>Section 9:</strong> Roadmap including ZK proofs, mixers, and cross-chain bridges</li>
        </ul>
      </section>

      {/* Conclusion */}
      <section className="glass border border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
        <p className="text-muted-foreground mb-4">
          SHADE provides practical privacy for Solana users through:
        </p>
        <ol className="list-decimal list-inside text-muted-foreground space-y-1 mb-4">
          <li><strong>Burner wallets</strong> — disposable, unlinkable addresses</li>
          <li><strong>Stealth addresses</strong> — one-time receive addresses</li>
          <li><strong>Passkeys</strong> — seedless, phishing-proof authentication</li>
          <li><strong>Gasless transactions</strong> — hidden fee payers</li>
        </ol>
        <p className="text-muted-foreground">
          Privacy is not about hiding wrongdoing—it's about financial autonomy.
          SHADE gives that choice back to users.
        </p>
      </section>

      {/* Download */}
      <section className="text-center">
        <a href="/docs/WHITEPAPER.md" download>
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4" />
            Download Full Whitepaper (Markdown)
          </Button>
        </a>
      </section>
    </div>
  );
}
