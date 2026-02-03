'use client';

import Link from 'next/link';
import { ArrowRight, Terminal, Key, Flame, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: 1,
    title: 'Access the App',
    description: 'Open SHADE in your browser. No installation required—everything runs locally.',
    code: null,
  },
  {
    number: 2,
    title: 'Set Up Your Password',
    description: 'Create a strong master password. This encrypts all your wallet keys locally using AES-256-GCM.',
    tip: 'Your password never leaves your device. We use 310,000 PBKDF2 iterations for key derivation.',
  },
  {
    number: 3,
    title: 'Create Your First Burner',
    description: 'Click "Create Burner" to generate a disposable Solana wallet. Give it a label like "NFT Mint" or "Testing".',
    code: null,
  },
  {
    number: 4,
    title: 'Fund Your Burner',
    description: 'Copy the burner address and send SOL to it from an exchange or another wallet.',
    tip: 'On devnet? Click "Request Airdrop" to get free test SOL.',
  },
  {
    number: 5,
    title: 'Use and Destroy',
    description: 'Use the burner for your transaction. When done, sweep remaining funds to a clean address and destroy the burner.',
    code: null,
  },
];

export default function GettingStarted() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <Terminal className="w-4 h-4" />
          Quick Start
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Getting Started</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Get up and running with SHADE in under 5 minutes. This guide walks you through
          creating your first burner wallet and making your first private transaction.
        </p>
      </div>

      {/* Prerequisites */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Prerequisites</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>A modern browser (Chrome, Firefox, Safari, Edge)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>Some SOL for transactions (or use devnet for testing)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            <span>A strong password you can remember</span>
          </li>
        </ul>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Step-by-Step Guide</h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.number} className="glass border border-white/5 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-3">{step.description}</p>
                  {step.tip && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm">
                      <span className="text-primary font-medium">Tip: </span>
                      <span className="text-muted-foreground">{step.tip}</span>
                    </div>
                  )}
                  {step.code && (
                    <div className="font-mono text-sm bg-black/30 rounded-lg p-4 mt-3">
                      <code className="text-muted-foreground">{step.code}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Setup */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Terminal className="w-5 h-5" />
          <h2 className="text-xl font-bold">Developer Setup</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Want to run SHADE locally or contribute to development?
        </p>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4 space-y-2">
          <div className="text-muted-foreground">
            <span className="text-green-400"># Clone the repository</span>
          </div>
          <div>git clone https://github.com/your-org/shade-wallet</div>
          <div className="text-muted-foreground pt-2">
            <span className="text-green-400"># Install dependencies</span>
          </div>
          <div>bun install</div>
          <div className="text-muted-foreground pt-2">
            <span className="text-green-400"># Start development server</span>
          </div>
          <div>bun dev</div>
          <div className="text-muted-foreground pt-2">
            <span className="text-green-400"># Run tests</span>
          </div>
          <div>bun test</div>
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Next Steps</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/docs/burner-wallets"
            className="glass border border-white/5 hover:border-primary/30 rounded-xl p-5 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Burner Wallets</h3>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Learn about disposable wallets in depth</p>
          </Link>
          <Link
            href="/docs/security"
            className="glass border border-white/5 hover:border-primary/30 rounded-xl p-5 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Security Model</h3>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Understand how SHADE keeps you safe</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
