'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
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
            <FileText className="w-6 h-6" />
            <span className="text-sm font-medium uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 2026</p>

          {/* Warning Banner */}
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-yellow-500 text-sm font-medium">
              ⚠️ IMPORTANT: SHADE is beta software. By using this application, you acknowledge
              the risks associated with cryptocurrency and experimental software.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using SHADE ("the Application"), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, do not use the Application.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                SHADE is a client-side cryptocurrency wallet application for the Solana blockchain.
                The Application provides:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Burner wallet creation and management</li>
                <li>Stealth address generation</li>
                <li>Passkey-based authentication</li>
                <li>Gasless transaction features</li>
              </ul>
              <p className="text-muted-foreground">
                The Application runs entirely in your browser and does not store any data on external servers.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">3. Beta Software Disclaimer</h2>
              <p className="text-muted-foreground">
                <strong className="text-foreground">SHADE IS BETA SOFTWARE.</strong> This means:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>The software may contain bugs, errors, or security vulnerabilities</li>
                <li>Features may change or be removed without notice</li>
                <li>The application is provided for testing and educational purposes</li>
                <li>You should not use this software with funds you cannot afford to lose</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">4. User Responsibilities</h2>
              <p className="text-muted-foreground">You are solely responsible for:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Securing your passwords and backup keys</li>
                <li>Maintaining backups of your wallet data</li>
                <li>Understanding the risks of cryptocurrency transactions</li>
                <li>Complying with applicable laws in your jurisdiction</li>
                <li>Any transactions you initiate through the Application</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">5. No Financial Advice</h2>
              <p className="text-muted-foreground">
                SHADE does not provide financial, investment, legal, or tax advice. The Application
                is a tool for managing cryptocurrency. You should consult appropriate professionals
                for advice specific to your situation.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                <strong className="text-foreground">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  SHADE is provided "AS IS" without warranties of any kind, express or implied
                </li>
                <li>
                  We are not liable for any direct, indirect, incidental, special, consequential,
                  or punitive damages arising from your use of the Application
                </li>
                <li>
                  We are not responsible for any loss of funds, data, or cryptocurrency
                </li>
                <li>
                  We are not liable for any losses resulting from bugs, exploits, or security
                  vulnerabilities
                </li>
                <li>
                  We are not responsible for actions taken by third parties, including blockchain
                  networks or wallet providers
                </li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">7. Prohibited Uses</h2>
              <p className="text-muted-foreground">You agree not to use SHADE for:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Any illegal activities or purposes</li>
                <li>Money laundering or terrorist financing</li>
                <li>Circumventing applicable laws or regulations</li>
                <li>Any activities that violate the rights of others</li>
              </ul>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">8. Intellectual Property</h2>
              <p className="text-muted-foreground">
                SHADE is open-source software. The source code is available under its respective
                license on GitHub. The SHADE name, logo, and branding remain the property of the
                project maintainers.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">9. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless SHADE, its developers, contributors, and
                affiliates from any claims, damages, losses, or expenses arising from your use of
                the Application or violation of these Terms.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">10. Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. Changes will be posted on
                this page. Your continued use of the Application after changes constitutes acceptance
                of the modified Terms.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to conflict of law principles.
              </p>
            </section>

            <section className="glass border border-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">12. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please reach out via:
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

            {/* Acknowledgment */}
            <section className="glass border border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
              <h2 className="text-xl font-semibold mb-4">Acknowledgment</h2>
              <p className="text-muted-foreground">
                By using SHADE, you acknowledge that you have read, understood, and agree to be
                bound by these Terms of Service. You also acknowledge that cryptocurrency
                transactions are irreversible and that you are solely responsible for securing
                your wallet and funds.
              </p>
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
