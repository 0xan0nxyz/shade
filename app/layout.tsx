import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SHADE | Privacy-First Burner Wallet',
  description: 'Burn smart. Stay anonymous. Zero-knowledge burner wallet manager for Solana.',
  keywords: ['solana', 'wallet', 'privacy', 'burner', 'crypto', 'web3'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-[#050508] text-gray-200 antialiased selection:bg-[#00ff88]/20 selection:text-[#00ff88]">
        {/* Animated background */}
        <div className="fixed inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="fixed inset-0 scan-line pointer-events-none" />
        
        {/* Ambient glow effects */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
