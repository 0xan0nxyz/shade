'use client';

import { Lock, Fingerprint, Shield, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PasskeyDocs() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <Lock className="w-4 h-4" />
          Core Feature
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Passkey Authentication</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Create wallets secured by biometrics (Face ID, Touch ID) or hardware security keys.
          No seed phrase to lose, no password to remember—your device IS the key.
        </p>
      </div>

      {/* What Are Passkeys */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">What Are Passkeys?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Passkeys are a modern authentication standard (WebAuthn/FIDO2) that replaces
            passwords with cryptographic keys stored in your device's secure hardware.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-red-400 mb-2">Traditional Wallet</h4>
              <ul className="text-sm space-y-1">
                <li>• 24-word seed phrase</li>
                <li>• Written on paper (losable)</li>
                <li>• Can be photographed/stolen</li>
                <li>• Phishing attacks possible</li>
              </ul>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">Passkey Wallet</h4>
              <ul className="text-sm space-y-1">
                <li>• Keys in secure enclave</li>
                <li>• Biometric protection</li>
                <li>• Can't be phished</li>
                <li>• Nothing to write down</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Fingerprint className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">1. Wallet Creation</h3>
                <p className="text-sm text-muted-foreground">
                  When you create a passkey wallet, your device generates a cryptographic keypair
                  in its secure element (Secure Enclave on Apple, TPM on Windows/Android).
                </p>
              </div>
            </div>
          </div>

          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">2. Key Storage</h3>
                <p className="text-sm text-muted-foreground">
                  The private key never leaves the secure hardware. It's protected by your
                  biometric (fingerprint/face) or device PIN. Even malware can't extract it.
                </p>
              </div>
            </div>
          </div>

          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">3. Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  To access your wallet or sign transactions, you authenticate with biometrics.
                  The secure element signs the request without exposing the key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Security Benefits</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Phishing-Proof', desc: 'Passkeys are bound to the website origin. Can\'t be tricked into signing for wrong site.' },
            { title: 'No Seed Phrase', desc: 'Nothing to write down, photograph, or lose in a house fire.' },
            { title: 'Hardware-Backed', desc: 'Private keys stored in tamper-resistant secure element.' },
            { title: 'Biometric Lock', desc: 'Requires your fingerprint or face to use—physical presence required.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Derivation */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Key Derivation</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            SHADE uses the standard Solana BIP-44 derivation path for passkey wallets:
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`m/44'/501'/0'/0'
     │    │   │  └── Address index
     │    │   └───── Change (external)
     │    └──────── Account
     └─────────── Solana coin type (501)`}
            </pre>
          </div>
          <p>
            You can derive multiple addresses from a single passkey for different purposes.
          </p>
        </div>
      </section>

      {/* Compatibility */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Device Compatibility</h2>
        <div className="glass border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Platform</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Support</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { platform: 'macOS (Safari, Chrome)', support: 'Touch ID, Face ID' },
                { platform: 'iOS (Safari)', support: 'Face ID, Touch ID' },
                { platform: 'Windows (Chrome, Edge)', support: 'Windows Hello, Security Keys' },
                { platform: 'Android (Chrome)', support: 'Fingerprint, Face Unlock' },
                { platform: 'Linux (Chrome)', support: 'Security Keys (YubiKey, etc.)' },
              ].map((row, i) => (
                <tr key={row.platform} className={i !== 4 ? 'border-b border-white/5' : ''}>
                  <td className="px-4 py-3">{row.platform}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Note */}
      <section className="glass border border-yellow-500/20 rounded-xl p-6 bg-gradient-to-br from-yellow-500/5 to-transparent">
        <h2 className="text-xl font-bold mb-3 text-yellow-400">Important Note</h2>
        <p className="text-muted-foreground">
          Passkey wallets are device-bound. If you lose your device without a backup,
          you lose access to the wallet. Consider using passkeys for smaller amounts
          or alongside traditional recovery options.
        </p>
      </section>

      {/* Next */}
      <div className="flex justify-end">
        <Link
          href="/docs/gasless"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          Next: Gasless Transactions
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
