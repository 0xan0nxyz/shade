'use client';

import { Eye, Key, Scan, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StealthAddressesDocs() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <Eye className="w-4 h-4" />
          Core Feature
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Stealth Addresses</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Generate unique one-time addresses for receiving payments. Each address is unlinkable
          to your identity or other stealth addresses, providing true payment privacy.
        </p>
      </div>

      {/* How It Works */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">How Stealth Addresses Work</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Traditional addresses are like posting your home address publicly—anyone can see
            all the mail you receive. Stealth addresses are like having a different PO Box
            for each sender that only you can access.
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`Traditional:
Sender_A → Your_Address ←──┐
Sender_B → Your_Address ←──┼── All linked to you
Sender_C → Your_Address ←──┘

Stealth:
Sender_A → Stealth_1 ←── Only you know this is yours
Sender_B → Stealth_2 ←── Unlinkable to Stealth_1
Sender_C → Stealth_3 ←── No connection to others`}
            </pre>
          </div>
        </div>
      </section>

      {/* Key Components */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Key Components</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Key,
              title: 'Master Seed',
              desc: 'A secret seed that generates all your stealth keypairs. Encrypted and stored locally.',
            },
            {
              icon: Scan,
              title: 'Meta Address',
              desc: 'A shareable address that senders use to generate unique stealth addresses for you.',
            },
            {
              icon: Eye,
              title: 'Scan Key',
              desc: 'Allows you to scan the blockchain and identify payments made to your stealth addresses.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass border border-white/5 rounded-xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flow */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Payment Flow</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Share Your Meta Address</h3>
              <p className="text-muted-foreground text-sm">
                You share your stealth meta-address publicly (on your website, social media, etc.).
                This doesn't reveal anything about your actual wallet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Sender Generates Unique Address</h3>
              <p className="text-muted-foreground text-sm">
                The sender uses your meta-address to derive a one-time stealth address
                that only you can spend from.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Payment Sent</h3>
              <p className="text-muted-foreground text-sm">
                The sender sends SOL to the stealth address. To blockchain observers,
                this looks like a random address with no connection to you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">You Scan and Claim</h3>
              <p className="text-muted-foreground text-sm">
                Using your scan key, you identify payments made to your stealth addresses.
                You can then sweep funds to any wallet you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            SHADE v1 uses a simplified deterministic stealth address model:
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`// Address Generation
master_seed = encrypted_storage.get('stealth:master_seed')
index = next_unused_index()
stealth_keypair = derive(master_seed, index)

// Each index produces unique keypair
stealth_address_0 = derive(seed, 0).publicKey
stealth_address_1 = derive(seed, 1).publicKey
// ... unlinkable to each other`}
            </pre>
          </div>
          <p>
            Future versions will implement full ECDH-based stealth addresses
            for enhanced cryptographic privacy.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Freelance Payments', desc: 'Receive client payments without revealing your main wallet or total earnings.' },
            { title: 'Donations', desc: 'Accept donations publicly while keeping your treasury private.' },
            { title: 'Payroll', desc: 'Pay employees to stealth addresses so salaries remain confidential.' },
            { title: 'Business Transactions', desc: 'Receive vendor payments without exposing your corporate treasury.' },
          ].map((item) => (
            <div key={item.title} className="glass border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next */}
      <div className="flex justify-end">
        <Link
          href="/docs/passkey"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          Next: Passkey Authentication
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
