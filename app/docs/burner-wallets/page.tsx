'use client';

import { Flame, Plus, Send, Trash2, Download, Upload, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BurnerWalletsDocs() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <Flame className="w-4 h-4" />
          Core Feature
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Burner Wallets</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Disposable Solana wallets that you can create, use, and destroy without leaving
          any trace back to your identity. Like a burner phone, but for crypto.
        </p>
      </div>

      {/* What Are Burners */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">What Are Burner Wallets?</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            A burner wallet is a temporary Solana keypair that exists only for a specific purpose.
            Unlike your main wallet which accumulates transaction history, burners are designed
            to be used once and destroyed.
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`Traditional Flow:
Main Wallet → Exchange → DEX → NFT → Mixer
     ↓
[All activity linked to one address forever]

Compartmentalized Flow:
Activity A: Burner_1 → NFT Purchase → [Destroyed]
Activity B: Burner_2 → DEX Trade → [Destroyed]
Activity C: Burner_3 → Airdrop Claim → [Destroyed]
     ↓
[Each activity is isolated from others]`}
            </pre>
          </div>
        </div>
      </section>

      {/* Privacy Model */}
      <section className="glass border border-yellow-500/20 rounded-xl p-6 bg-yellow-500/5">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-yellow-500">⚠️</span> Understanding the Privacy Model
        </h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            <strong className="text-foreground">Honest truth:</strong> If you fund a burner directly from your
            main wallet, there IS an on-chain trace between them. SHADE provides <em>compartmentalization</em>,
            not magic invisibility.
          </p>

          <div className="space-y-3">
            <p className="font-medium text-foreground">What burners actually provide:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong>Forward privacy:</strong> Destinations (dApps, NFT sellers) don't see your main wallet's full history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong>Activity isolation:</strong> Different activities can't be linked to each other</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong>Risk containment:</strong> Risky contracts never touch your main holdings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span><strong>Casual observer resistance:</strong> Makes tracking harder (not impossible)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <p className="font-medium text-foreground">For stronger privacy, break the funding chain:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Withdraw from a CEX directly to your burner address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Bridge from another chain to a fresh address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Receive P2P from someone who doesn't know your main wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Use the burner to receive payments first, then spend</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Burner Lifecycle</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Plus, title: 'Create', desc: 'Generate new keypair, encrypt and store locally' },
            { icon: Download, title: 'Fund', desc: 'Send SOL to the burner address' },
            { icon: Send, title: 'Use', desc: 'Execute transactions with the burner' },
            { icon: Trash2, title: 'Destroy', desc: 'Sweep funds and erase keys permanently' },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="glass border border-white/5 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Operations */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Operations</h2>
        <div className="space-y-6">
          {/* Create */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Creating a Burner
            </h3>
            <p className="text-muted-foreground mb-3">
              Click "Create Burner" and optionally add a label. A new Ed25519 keypair is generated,
              the private key is encrypted with your password, and stored in IndexedDB.
            </p>
            <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
              <pre className="text-muted-foreground">
{`// Under the hood
keypair = Keypair.generate()
encrypted = AES-GCM(privateKey, derivedKey)
store(burnerId, { publicKey, encrypted })`}
              </pre>
            </div>
          </div>

          {/* Sweep */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              Sweeping Funds
            </h3>
            <p className="text-muted-foreground mb-3">
              Before destroying a burner, sweep all remaining SOL to another address.
              This transfers the balance minus the transaction fee.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-sm">
              <span className="text-yellow-400 font-medium">Warning: </span>
              <span className="text-muted-foreground">
                Always sweep funds before destroying. Once destroyed, keys cannot be recovered.
              </span>
            </div>
          </div>

          {/* Destroy */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              Destroying a Burner
            </h3>
            <p className="text-muted-foreground mb-3">
              Permanently deletes the encrypted private key from storage. This is cryptographic
              erasure—the key material is overwritten and cannot be recovered.
            </p>
          </div>

          {/* Export/Import */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              Backup & Restore
            </h3>
            <p className="text-muted-foreground mb-3">
              Export all burners to an encrypted JSON file for backup. Import on another device
              or browser using the same password.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'NFT Minting', desc: 'Create a burner for each mint. Your collection stays private.' },
            { title: 'DeFi Testing', desc: 'Try new protocols without exposing your main wallet.' },
            { title: 'Receiving Payments', desc: 'Give clients unique addresses that can\'t be linked.' },
            { title: 'Privacy Donations', desc: 'Donate without revealing your identity or holdings.' },
          ].map((item) => (
            <div key={item.title} className="glass border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Note */}
      <section className="glass border border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <h2 className="text-xl font-bold mb-3">Security Considerations</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Private keys are encrypted with AES-256-GCM before storage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Keys never leave your device—all crypto runs in browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Destruction is permanent—no recovery possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Export files are password-protected for safe backup</span>
          </li>
        </ul>
      </section>

      {/* Next */}
      <div className="flex justify-end">
        <Link
          href="/docs/stealth-addresses"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          Next: Stealth Addresses
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
