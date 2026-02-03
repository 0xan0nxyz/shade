'use client';

import Link from 'next/link';
import { Ghost, Flame, Shield, Eye, Zap, Lock, ArrowLeft, ExternalLink, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Flame className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Burner Wallets',
    description: 'Generate disposable Solana wallets instantly. Use once and destroy - no trace left behind.',
  },
  {
    icon: <Eye className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Stealth Addresses',
    description: 'Receive funds at one-time addresses that only you can link to your wallet.',
  },
  {
    icon: <Lock className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Passkey Auth',
    description: 'Secure your wallet with biometric authentication - Face ID, Touch ID, or hardware keys.',
  },
  {
    icon: <Zap className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Gasless Transactions',
    description: 'Prepaid burners for transactions without linking your main wallet for fees.',
  },
  {
    icon: <Shield className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Local Encryption',
    description: 'All keys are encrypted and stored locally. Nothing ever touches a server.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl">🌒</span>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                  SHADE
                </h1>
                <p className="text-xs sm:text-sm text-primary font-semibold uppercase tracking-wide">
                  Privacy Wallet
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/docs">
                <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:border-white/20">
                  <Book className="w-4 h-4" strokeWidth={1.5} />
                  Docs
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:border-white/20">
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <Ghost className="w-3.5 h-3.5" strokeWidth={1.5} />
            Privacy-First Wallet
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            What is <span className="text-gradient">Shade</span>?
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A zero-knowledge burner wallet manager for Solana. Generate disposable wallets,
            maintain privacy, and leave no trace on-chain.
          </p>
        </div>

        {/* Why Privacy Matters */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Why Privacy Matters</h2>
          <div className="glass border border-white/5 rounded-xl p-6 space-y-4 text-muted-foreground">
            <p>
              Every transaction on Solana is public. Your main wallet address can be linked to your identity,
              spending habits, and financial history. This creates risks:
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Targeted phishing based on your holdings</li>
              <li>Price manipulation when large trades are detected</li>
              <li>Personal safety risks from visible wealth</li>
              <li>Loss of financial privacy in everyday transactions</li>
            </ul>
            <p>
              Shade solves this by letting you create burner wallets for specific purposes -
              mint an NFT, try a new DeFi protocol, or receive payments - then sweep the funds
              and destroy the wallet.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <div className="grid gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all"
              >
                <div className="flex gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary h-fit">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Model */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Security Model</h2>
          <div className="glass border border-white/5 rounded-xl p-6 space-y-4 text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <p className="font-medium text-foreground">Keys Never Leave Your Device</p>
                <p className="text-sm">All private keys are generated and stored locally. No server ever sees your keys.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <p className="font-medium text-foreground">AES-256 Encryption</p>
                <p className="text-sm">Your keys are encrypted with a password you set. Without it, the data is unreadable.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <p className="font-medium text-foreground">Open Source</p>
                <p className="text-sm">The code is fully auditable. Don't trust - verify.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="glass border border-primary/20 rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent">
            <h2 className="text-2xl font-bold mb-3">Ready to Go Private?</h2>
            <p className="text-muted-foreground mb-6">
              Start creating burner wallets and take control of your on-chain privacy.
            </p>
            <Link href="/">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                Launch App
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <span className="text-primary">◈</span>
            <span className="font-medium">Keys encrypted locally</span>
          </div>
          <p className="text-muted-foreground/60 text-xs uppercase tracking-wider font-medium">
            SHADE v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
