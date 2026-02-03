'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 glass">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">🌒</span>
              <span className="text-lg font-bold">SHADE</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2 border-white/10">
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 text-primary">
            <Shield className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">1. Overview</h2>
              <p className="text-muted-foreground">
                SHADE ("we", "our", or "the application") is a privacy-focused cryptocurrency wallet
                for Solana. This Privacy Policy explains how we handle your information when you use
                our application.
              </p>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Key Point:</strong> SHADE is designed with privacy
                as a core principle. We do not collect, store, or transmit your personal data,
                private keys, or transaction information to any server.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">2. Data We Do NOT Collect</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Private keys or seed phrases</li>
                <li>Wallet addresses</li>
                <li>Transaction history</li>
                <li>Account balances</li>
                <li>Personal identification information</li>
                <li>IP addresses or location data</li>
                <li>Usage analytics or tracking data</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">3. Local Storage</h2>
              <p className="text-muted-foreground">
                All sensitive data is stored locally on your device using encrypted storage
                (AES-256-GCM). This includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Encrypted private keys (never stored in plaintext)</li>
                <li>Burner wallet configurations</li>
                <li>Stealth address seeds</li>
                <li>Application preferences</li>
              </ul>
              <p className="text-muted-foreground">
                This data never leaves your device and is protected by your password.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">4. Blockchain Interactions</h2>
              <p className="text-muted-foreground">
                When you perform transactions, SHADE interacts directly with the Solana blockchain
                through public RPC endpoints. These transactions are:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Recorded on the public Solana blockchain (as with any blockchain transaction)</li>
                <li>Not associated with any personal information by SHADE</li>
                <li>Subject to Solana network's inherent transparency</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
              <p className="text-muted-foreground">
                SHADE may use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Solana RPC Providers:</strong> For blockchain interactions</li>
                <li><strong>Wallet Adapters:</strong> For connecting external wallets (e.g., Phantom)</li>
              </ul>
              <p className="text-muted-foreground">
                These services have their own privacy policies. We recommend reviewing them.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">6. Security</h2>
              <p className="text-muted-foreground">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>AES-256-GCM encryption for all sensitive data</li>
                <li>PBKDF2 key derivation with 310,000 iterations</li>
                <li>No server-side storage of any user data</li>
                <li>Open-source code for transparency and auditing</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">7. Your Rights</h2>
              <p className="text-muted-foreground">
                Since we don't collect your data, traditional data rights (access, deletion, etc.)
                don't apply. However, you have full control over your local data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Export your data anytime using the backup feature</li>
                <li>Delete all local data by clearing browser storage</li>
                <li>Use the application without any account or registration</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. Any changes will be posted
                on this page with an updated revision date.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">9. Contact</h2>
              <p className="text-muted-foreground">
                For questions about this Privacy Policy, please reach out via:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  Twitter/X:{' '}
                  <a href="https://x.com/0x_anonnn" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    @0x_anonnn
                  </a>
                </li>
                <li>
                  GitHub:{' '}
                  <a href="https://github.com/0x-anon" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    github.com/0x-anon
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 text-center">
        <p className="text-muted-foreground/60 text-sm">© 2026 SHADE. All rights reserved.</p>
      </footer>
    </div>
  );
}
