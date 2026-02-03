import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHADE | Privacy Wallet',
  description: 'Burn smart. Stay anonymous. Zero-knowledge burner wallet manager for Solana.',
  keywords: ['solana', 'wallet', 'privacy', 'burner', 'crypto', 'web3', 'anonymous'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {/* Subtle Vignette */}
        <div className="vignette" />

        {/* Atmospheric Glows */}
        <div className="atmosphere-glow atmosphere-glow-primary" style={{ top: '-300px', left: '-300px' }} />
        <div className="atmosphere-glow atmosphere-glow-accent" style={{ bottom: '-300px', right: '-300px' }} />

        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
