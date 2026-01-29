'use client';

import { BurnerWithBalance } from '@/lib/burner';
import { formatAddress, formatSOL } from '@/lib/utils';
import { getExplorerUrl } from '@/lib/solana';

interface BurnerCardProps {
  burner: BurnerWithBalance;
  isExpanded: boolean;
  isMobile: boolean;
  onToggleExpand: () => void;
  onCopy: () => void;
  onSweep: () => void;
  onDestroy: () => void;
}

export function BurnerCard({
  burner,
  isExpanded,
  isMobile,
  onToggleExpand,
  onCopy,
  onSweep,
  onDestroy,
}: BurnerCardProps) {
  return (
    <div
      className={`glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer ${
        isExpanded ? 'ring-1 ring-primary/30' : ''
      }`}
      onClick={onToggleExpand}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-base sm:text-xl font-bold border border-white/10 flex-shrink-0">
            {burner.label.split('_')[1]}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{burner.label}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {formatAddress(burner.publicKey, isMobile ? 6 : 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-base sm:text-xl font-bold text-primary">{formatSOL(burner.balance)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">SOL</p>
          </div>
          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${burner.balance > 0 ? 'bg-primary animate-pulse' : 'bg-white/20'}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="py-2 sm:py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-1"
            >
              📋 <span className="hidden sm:inline">Copy</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSweep();
              }}
              className="py-2 sm:py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all text-xs sm:text-sm flex items-center justify-center gap-1"
            >
              💸 <span className="hidden sm:inline">Sweep</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getExplorerUrl(burner.publicKey), '_blank');
              }}
              className="py-2 sm:py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-xs sm:text-sm flex items-center justify-center gap-1"
            >
              🔗 <span className="hidden sm:inline">Explorer</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDestroy();
              }}
              className="py-2 sm:py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all text-xs sm:text-sm flex items-center justify-center gap-1 text-red-400"
            >
              💀 <span className="hidden sm:inline">Destroy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
