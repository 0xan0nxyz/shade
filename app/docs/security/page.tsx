'use client';

import { Shield, Lock, Key, AlertTriangle, CheckCircle2, Server, Eye, Cpu } from 'lucide-react';

export default function SecurityDocs() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
          <Shield className="w-4 h-4" />
          Security
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Security Architecture</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          SHADE implements military-grade encryption with defense in depth. All cryptographic
          operations run locally in your browser—nothing is ever sent to any server.
        </p>
      </div>

      {/* Core Principles */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Core Principles</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              icon: Server,
              title: 'Zero Trust',
              desc: 'No server ever sees your keys. All encryption/decryption happens in your browser.',
            },
            {
              icon: Lock,
              title: 'Defense in Depth',
              desc: 'Multiple layers of protection: encryption, isolation, detection, self-destruct.',
            },
            {
              icon: Key,
              title: 'Key Isolation',
              desc: 'Each feature uses purpose-specific encryption keys derived from your password.',
            },
            {
              icon: Eye,
              title: 'Minimal Exposure',
              desc: 'Private keys are decrypted only when needed and for the shortest time possible.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Encryption Standards */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Encryption Standards</h2>
        <div className="glass border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Component</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Standard</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { component: 'Encryption', standard: 'AES-256-GCM', details: 'Authenticated encryption with 256-bit keys' },
                { component: 'Key Derivation', standard: 'PBKDF2', details: '310,000 iterations (OWASP 2025)' },
                { component: 'Hashing', standard: 'SHA-512', details: 'Integrity verification checksums' },
                { component: 'MAC', standard: 'HMAC-SHA-256', details: 'Message authentication codes' },
                { component: 'Random', standard: 'CSPRNG', details: 'Cryptographically secure random via Web Crypto' },
              ].map((row, i) => (
                <tr key={row.component} className={i !== 4 ? 'border-b border-white/5' : ''}>
                  <td className="px-4 py-3 font-medium">{row.component}</td>
                  <td className="px-4 py-3 text-primary font-mono">{row.standard}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Encryption Pipeline */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Encryption Pipeline</h2>
        <div className="font-mono text-sm bg-black/30 rounded-lg p-4 overflow-x-auto">
          <pre className="text-muted-foreground">
{`plaintext
    │
    ▼
┌───────────────┐
│ PBKDF2        │ password + salt → derived_key
│ 310k iterations│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ AES-256-GCM   │ plaintext + key + iv → ciphertext
│ random IV     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ SHA-512       │ ciphertext → checksum
└───────┬───────┘
        │
        ▼
{ iv, salt, ciphertext, checksum }`}
          </pre>
        </div>
      </section>

      {/* Storage */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Secure Storage</h2>
        <div className="space-y-4 text-muted-foreground">
          <p>
            All sensitive data is stored in IndexedDB with purpose-based key isolation:
          </p>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4">
            <pre>
{`SecureKeyManager (IndexedDB)
├── burner:{id}      → encrypted burner private key
├── stealth:master   → encrypted stealth master seed
├── stealth:{idx}    → encrypted stealth spend key
├── gasless:{id}     → encrypted fee payer key
└── passkey:{id}     → encrypted passkey credential`}
            </pre>
          </div>
          <p>
            Each key type uses a different encryption purpose, so compromising one
            doesn't expose others.
          </p>
        </div>
      </section>

      {/* Threat Detection */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Threat Detection</h2>
        <div className="glass border border-white/5 rounded-xl p-6">
          <p className="text-muted-foreground mb-4">
            SHADE actively monitors for tampering and attacks:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { threat: 'Debugger Detection', desc: 'Detects if browser debugger is attached' },
              { threat: 'DevTools Monitoring', desc: 'Monitors for DevTools opening' },
              { threat: 'Code Integrity', desc: 'Verifies critical functions aren\'t modified' },
              { threat: 'Breakpoint Detection', desc: 'Detects breakpoints in security code' },
              { threat: 'Print Screen', desc: 'Monitors for screenshot attempts' },
              { threat: 'Timing Attacks', desc: 'Freshness verification on encrypted data' },
            ].map((item) => (
              <div key={item.threat} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{item.threat}</span>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Self-Destruct */}
      <section className="glass border border-red-500/20 rounded-xl p-6 bg-gradient-to-br from-red-500/5 to-transparent">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Self-Destruct Protocol
        </h2>
        <p className="text-muted-foreground mb-4">
          If tampering is detected, SHADE automatically:
        </p>
        <ol className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">1.</span>
            <span>Wipes all encrypted storage (IndexedDB)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">2.</span>
            <span>Clears session data and memory</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">3.</span>
            <span>Logs the threat type (locally only)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold">4.</span>
            <span>Displays security alert to user</span>
          </li>
        </ol>
      </section>

      {/* Threat Model */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Threat Model</h2>
        <div className="space-y-4">
          <div className="glass border border-white/5 rounded-xl p-5">
            <h3 className="font-semibold mb-3 text-green-400">Threats Addressed</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                'Key theft via malware',
                'Blockchain surveillance',
                'Phishing attacks',
                'Brute force attacks',
                'Memory dumps',
                'Code tampering',
                'Session hijacking',
                'Timing attacks',
              ].map((threat) => (
                <div key={threat} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-muted-foreground">{threat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass border border-white/5 rounded-xl p-5">
            <h3 className="font-semibold mb-3 text-yellow-400">Out of Scope</h3>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {[
                'Compromised device OS',
                'Physical coercion',
                'Nation-state attacks',
                'Quantum computing (future)',
              ].map((threat) => (
                <div key={threat} className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-muted-foreground">{threat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Session Security */}
      <section className="glass border border-white/5 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Session Security</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">5 min</div>
            <div className="text-sm text-muted-foreground">Inactivity timeout</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">10/min</div>
            <div className="text-sm text-muted-foreground">Transaction rate limit</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">Auto</div>
            <div className="text-sm text-muted-foreground">Session lock on blur</div>
          </div>
        </div>
      </section>

      {/* Web Crypto */}
      <section className="glass border border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Web Crypto API</h2>
        </div>
        <p className="text-muted-foreground">
          All cryptographic operations use the browser's native Web Crypto API—a
          battle-tested, audited implementation maintained by browser vendors.
          No third-party crypto libraries with potential vulnerabilities.
        </p>
      </section>
    </div>
  );
}
