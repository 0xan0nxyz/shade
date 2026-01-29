'use client';

import { formatSOL } from '@/lib/utils';
import { Network } from '@/lib/constants';
import { Flame, Coins, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  burnerCount: number;
  totalBalance: number;
  network: Network;
}

const networkConfig: Record<Network, { label: string; gradient: string; iconColor: string }> = {
  mainnet: {
    label: 'MAINNET',
    gradient: 'from-red-500 to-rose-600',
    iconColor: 'text-red-400',
  },
  devnet: {
    label: 'DEVNET',
    gradient: 'from-yellow-400 to-amber-500',
    iconColor: 'text-yellow-400',
  },
  testnet: {
    label: 'TESTNET',
    gradient: 'from-blue-400 to-indigo-500',
    iconColor: 'text-blue-400',
  },
};

export function StatsCards({ burnerCount, totalBalance, network }: StatsCardsProps) {
  const config = networkConfig[network];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10 max-w-3xl mx-auto">
      {/* Burners Card */}
      <Card className="glass border border-white/5 hover:border-white/10 transition-all">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center sm:items-start justify-between">
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Burners
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {burnerCount}
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Card */}
      <Card className="glass border border-white/5 hover:border-white/10 transition-all">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center sm:items-start justify-between">
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Balance
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gradient tracking-tight">
                {formatSOL(totalBalance)}
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Card */}
      <Card className="glass border border-white/5 hover:border-white/10 transition-all">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center sm:items-start justify-between">
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Network
              </p>
              <p className={`text-base sm:text-lg font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent tracking-tight`}>
                {config.label}
              </p>
            </div>
            <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${config.gradient} border border-white/10`}>
              <Globe className={`w-4 h-4 sm:w-5 sm:h-5 ${config.iconColor}`} strokeWidth={1.5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
