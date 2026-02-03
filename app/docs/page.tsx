'use client';

import Link from 'next/link';
import { Flame, Eye, Lock, Zap, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Flame,
    title: 'Burner Wallets',
    description: 'Disposable wallets you can create, use, and destroy without trace',
    href: '/docs/burner-wallets',
  },
  {
    icon: Eye,
    title: 'Stealth Addresses',
    description: 'One-time receive addresses that cannot be linked together',
    href: '/docs/stealth-addresses',
  },
  {
    icon: Lock,
    title: 'Passkey Auth',
    description: 'Biometric authentication without seed phrases',
    href: '/docs/passkey',
  },
  {
    icon: Zap,
    title: 'Gasless Transactions',
    description: 'Pay fees from a separate hidden wallet',
    href: '/docs/gasless',
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'AES-256-GCM encryption with tamper detection',
    href: '/docs/security',
  },
];

const comparisons = [
  { feature: 'Create wallet', traditional: true, shade: true },
  { feature: 'Send/receive crypto', traditional: true, shade: true },
  { feature: 'Disposable wallets', traditional: false, shade: true },
  { feature: 'Untraceable payments', traditional: false, shade: true },
  { feature: 'Biometric login', traditional: false, shade: true },
  { feature: 'Hidden fee payer', traditional: false, shade: true },
  { feature: 'Tamper protection', traditional: false, shade: true },
];

export default function DocsOverview() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          SHADE <span className="text-gradient">Documentation</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          SHADE is a privacy-first wallet for Solana that enables untraceable transactions,
          disposable wallets, and military-grade encryption—all running locally in your browser.
        </p>
      </div>

      {/* The Problem */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">The Problem</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>Traditional crypto wallets expose everything:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✕</span>
              <span>Every transaction is permanently visible on-chain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✕</span>
              <span>Your balance is public knowledge</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✕</span>
              <span>All addresses can be linked back to you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">✕</span>
              <span>Seed phrases can be stolen or phished</span>
            </li>
          </ul>
          <p className="pt-2 font-medium text-foreground">
            Result: No financial privacy. Anyone can track your crypto activity.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Core Features</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="glass border border-white/5 hover:border-primary/30 rounded-xl p-5 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      {feature.title}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="text-2xl font-bold mb-6">SHADE vs Traditional Wallets</h2>
        <div className="glass border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Feature</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Traditional</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-primary">SHADE</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr key={row.feature} className={i !== comparisons.length - 1 ? 'border-b border-white/5' : ''}>
                  <td className="px-4 py-3 text-sm">{row.feature}</td>
                  <td className="px-4 py-3 text-center">
                    {row.traditional ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <span className="text-red-400">✕</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How It Works */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4 overflow-x-auto">
            <pre className="text-muted-foreground">
{`Traditional Wallet:
Alice → Bob → Charlie  (All visible, all linked)

SHADE:
Alice → Burner_1 → Stealth_A  (Unlinkable, untraceable)
              ↓
         [Destroyed]`}
            </pre>
          </div>
          <p className="text-muted-foreground">
            SHADE breaks the chain of transaction visibility by using disposable wallets
            and one-time addresses that cannot be linked together.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="glass border border-primary/20 rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Follow our quick start guide to set up SHADE and create your first burner wallet.
        </p>
        <Link href="/docs/getting-started">
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            Get Started
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </Link>
      </section>
    </div>
  );
}
