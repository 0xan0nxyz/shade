'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Book, Flame, Eye, Lock, Zap, Shield, Rocket, FileText, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview', href: '/docs', icon: Book },
  { name: 'Getting Started', href: '/docs/getting-started', icon: Rocket },
  { name: 'Burner Wallets', href: '/docs/burner-wallets', icon: Flame },
  { name: 'Stealth Addresses', href: '/docs/stealth-addresses', icon: Eye },
  { name: 'Passkey Auth', href: '/docs/passkey', icon: Lock },
  { name: 'Gasless Transactions', href: '/docs/gasless', icon: Zap },
  { name: 'Security', href: '/docs/security', icon: Shield },
  { name: 'Whitepaper', href: '/docs/whitepaper', icon: FileText },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl">🌒</span>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                  SHADE
                </h1>
                <p className="text-xs sm:text-sm text-primary font-semibold uppercase tracking-wide">
                  Documentation
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <article className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10">
              {children}
            </article>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <span className="text-primary">◈</span>
            <span className="font-medium">Your keys. Your coins. Your privacy.</span>
          </div>
          <p className="text-muted-foreground/60 text-xs uppercase tracking-wider font-medium">
            SHADE v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
