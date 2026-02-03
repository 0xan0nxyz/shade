'use client';

import { Zap, Wallet, ArrowRight, Eye, EyeOff, Send } from 'lucide-react';
import Link from 'next/link';

export default function GaslessDocs() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <Zap className="w-4 h-4" />
          Core Feature
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Gasless Transactions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Pay transaction fees from a different wallet than your main one. Your primary
          wallet never appears as the fee payer on-chain, adding an extra layer of privacy.
        </p>
      </div>

      {/* The Problem */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">The Problem</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            On Solana, every transaction requires a fee payer. By default, this is the
            sender's wallet. This creates a privacy leak:
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`Standard Transaction:
fee_payer: Your_Main_Wallet  ← Visible on-chain
signatures: [Your_Main_Wallet]
instructions: [transfer 100 SOL to Recipient]

Problem: Your main wallet is now linked to this transaction`}
            </pre>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">The Solution</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            SHADE allows you to designate a separate wallet (typically a burner) as the
            fee payer. Your main wallet signs the transaction intent, but the fee comes
            from elsewhere.
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`Gasless Transaction:
fee_payer: Burner_Wallet  ← This appears on-chain
signatures: [
  Main_Wallet,    ← Signs the intent
  Burner_Wallet   ← Pays the fee
]
instructions: [transfer 100 SOL to Recipient]

Result: Observers see Burner_Wallet, not your main wallet`}
            </pre>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create a Prepaid Burner</h3>
                <p className="text-sm text-muted-foreground">
                  Create a burner wallet and fund it with a small amount of SOL (0.1 SOL
                  is enough for hundreds of transactions).
                </p>
              </div>
            </div>
          </div>

          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Set as Fee Payer</h3>
                <p className="text-sm text-muted-foreground">
                  Designate the burner as your active fee payer. All subsequent transactions
                  will use this wallet for fees.
                </p>
              </div>
            </div>
          </div>

          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Send Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  When you send a transaction, both wallets sign it—your main wallet for
                  authorization, the fee payer for the fee.
                </p>
              </div>
            </div>
          </div>

          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Rotate as Needed</h3>
                <p className="text-sm text-muted-foreground">
                  When the fee payer runs low or you want fresh privacy, create a new
                  burner and destroy the old one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Comparison */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Privacy Comparison</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold">Standard Transaction</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Fee payer = sender (visible)</li>
              <li>• Main wallet exposed</li>
              <li>• Transaction history linkable</li>
              <li>• Balance deducible</li>
            </ul>
          </div>
          <div className="glass border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <EyeOff className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Gasless Transaction</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Fee payer = burner (disposable)</li>
              <li>• Main wallet hidden</li>
              <li>• Burner can be destroyed</li>
              <li>• No link to your identity</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Solana transactions support separate fee payers natively. SHADE leverages this:
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`async function sendWithFeePayer(
  transaction,
  mainKeypair,
  feePayerKeypair
) {
  // Set fee payer to burner
  transaction.feePayer = feePayerKeypair.publicKey;

  // Get recent blockhash
  transaction.recentBlockhash = await getBlockhash();

  // Both wallets sign
  transaction.sign(mainKeypair, feePayerKeypair);

  return await sendTransaction(transaction);
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Use Cases</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Cold Wallet Transactions', desc: 'Keep your cold storage address hidden while still transacting.' },
            { title: 'Treasury Operations', desc: 'DAO treasuries can transact without revealing the main wallet.' },
            { title: 'Whale Privacy', desc: 'Large holders can move funds without signaling to the market.' },
            { title: 'Combined with Burners', desc: 'Ultimate privacy: burner as sender + different burner as fee payer.' },
          ].map((item) => (
            <div key={item.title} className="glass border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost */}
      <section className="glass border border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <h2 className="text-xl font-bold mb-3">Cost Efficiency</h2>
        <p className="text-muted-foreground mb-4">
          Solana transaction fees are incredibly low:
        </p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">~0.000005</div>
            <div className="text-sm text-muted-foreground">SOL per transaction</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">~200,000</div>
            <div className="text-sm text-muted-foreground">transactions per SOL</div>
          </div>
        </div>
      </section>

      {/* Next */}
      <div className="flex justify-end">
        <Link
          href="/docs/security"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          Next: Security
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
