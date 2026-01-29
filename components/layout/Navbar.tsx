'use client';

import { useState } from 'react';

type Network = 'devnet' | 'testnet';

interface NavbarProps {
  network: Network;
  onNetworkChange: (network: Network) => void;
  onAirdropRequest?: () => void;
  airdropDisabled?: boolean;
}

export function Navbar({
  network,
  onNetworkChange,
  onAirdropRequest,
  airdropDisabled = false,
}: NavbarProps) {
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);

  const networkColors = {
    devnet: 'from-green-500 to-emerald-500',
    testnet: 'from-yellow-500 to-orange-500',
  };

  const networkNames = {
    devnet: 'Devnet',
    testnet: 'Testnet',
  };

  return (
    <nav className="flex items-center justify-between mb-8 sm:mb-12">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-lg sm:text-xl">
          🔥
        </div>
        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          SHADE
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Network Selector */}
        <div className="relative">
          <button
            onClick={() => setShowNetworkMenu(!showNetworkMenu)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-gradient-to-r ${networkColors[network]} text-white flex items-center gap-1.5 sm:gap-2`}
          >
            <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            {networkNames[network]}
            <span className="opacity-70">▼</span>
          </button>

          {showNetworkMenu && (
            <div className="absolute top-full mt-2 right-0 w-36 sm:w-40 bg-background/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden z-50 shadow-xl">
              {(['devnet', 'testnet'] as Network[]).map((net) => (
                <button
                  key={net}
                  onClick={() => {
                    onNetworkChange(net);
                    setShowNetworkMenu(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 flex items-center gap-2 transition-colors ${
                    network === net ? 'text-white bg-white/5' : 'text-muted-foreground'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${networkColors[net]}`} />
                  {networkNames[net]}
                  {network === net && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Faucet Button */}
        {onAirdropRequest && (
          <button
            onClick={onAirdropRequest}
            disabled={airdropDisabled || network !== 'devnet'}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚰 Faucet
          </button>
        )}
      </div>
    </nav>
  );
}
