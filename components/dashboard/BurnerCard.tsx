'use client';

import { BurnerWithBalance } from '@/lib/burner';
import { formatAddress, formatSOL } from '@/lib/utils';
import { getExplorerUrl } from '@/lib/solana';
import { Copy, ExternalLink, Flame, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BurnerCardProps {
  burner: BurnerWithBalance;
  isExpanded: boolean;
  isMobile: boolean;
  onToggleExpand: (open: boolean) => void;
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
    <div className="w-full">
      {/* Header - clickable to toggle */}
      <div
        onClick={() => onToggleExpand(!isExpanded)}
        className="glass rounded-xl p-3 sm:p-5 hover:bg-white/[0.02] transition-all duration-200 border border-white/5 hover:border-white/10 cursor-pointer"
      >
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Burner Icon */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-primary" strokeWidth={1.5} />
            </div>
            {burner.balance > 0 && (
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse shadow-[0_0_8px_hsla(158,72%,38%,0.6)]" />
            )}
          </div>

          {/* Burner Info - Centered */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 mb-0.5 sm:mb-1">
              <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                {burner.label}
              </h3>
              {burner.balance > 0 && (
                <Badge variant="outline" className="border-primary/30 text-primary text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0 h-auto font-medium flex-shrink-0">
                  ACTIVE
                </Badge>
              )}
            </div>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground">
              {formatAddress(burner.publicKey, isMobile ? 4 : 10)}
            </p>
          </div>

          {/* Balance - Centered */}
          <div className="text-center">
            <p className="font-semibold text-lg sm:text-2xl text-gradient tracking-tight">
              {formatSOL(burner.balance)}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">SOL</p>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass rounded-xl p-3 sm:p-5 border border-white/5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onCopy(); }}
              className="font-medium text-xs sm:text-sm border-white/10 hover:border-white/20 hover:bg-white/5 h-9 sm:h-10"
            >
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" strokeWidth={1.5} />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onSweep(); }}
              className="font-medium text-xs sm:text-sm border-primary/20 hover:border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary h-9 sm:h-10"
            >
              <Ghost className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" strokeWidth={1.5} />
              Sweep
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); window.open(getExplorerUrl(burner.publicKey), '_blank'); }}
              className="font-medium text-xs sm:text-sm border-white/10 hover:border-white/20 hover:bg-white/5 h-9 sm:h-10"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" strokeWidth={1.5} />
              Explorer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDestroy(); }}
              className="font-medium text-xs sm:text-sm border-red-500/20 hover:border-red-500/30 hover:bg-red-500/5 text-red-400 h-9 sm:h-10"
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" strokeWidth={1.5} />
              Destroy
            </Button>
          </div>

          {/* Full Address Display */}
          <div className="pt-3 sm:pt-4 border-t border-white/5">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mb-1.5 sm:mb-2">Public Key</p>
            <p className="font-mono text-[10px] sm:text-sm text-foreground/70 break-all leading-relaxed">
              {burner.publicKey}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
