'use client';

import { formatSOL } from '@/lib/utils';
import { Network } from '@/lib/constants';

interface StatsCardsProps {
  burnerCount: number;
  totalBalance: number;
  network: Network;
}

const networkColors: Record<Network, string> = {
  mainnet: 'from-red-500 to-rose-600',
  devnet: 'from-yellow-400 to-amber-500',
  testnet: 'from-blue-400 to-indigo-500',
};

const networkNames: Record<Network, string> = {
  mainnet: 'Mainnet',
  devnet: 'Devnet',
  testnet: 'Testnet',
};

export function StatsCards({ burnerCount, totalBalance, network }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-8">
      <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-[10px] sm:text-xs">Burners</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1">{burnerCount}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 sm:rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center text-lg sm:text-xl rounded-lg">
            🔥
          </div>
        </div>
      </div>

      <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-[10px] sm:text-xs">Balance</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1 text-primary">{formatSOL(totalBalance)}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 sm:rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg sm:text-xl rounded-lg">
            ◎
          </div>
        </div>
      </div>

      <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-muted-foreground text-[10px] sm:text-xs truncate">Network</p>
            <p className={`text-sm sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1 truncate bg-gradient-to-r ${networkColors[network]} bg-clip-text text-transparent`}>{networkNames[network]}</p>
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 sm:rounded-xl bg-gradient-to-br ${networkColors[network]} flex items-center justify-center text-lg sm:text-xl rounded-lg opacity-80`}>
            🌐
          </div>
        </div>
      </div>
    </div>
  );
}
