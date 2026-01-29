'use client';

import { BackButton } from '../shared';
import { formatSOL } from '@/lib/utils';

interface TransferViewProps {
  recipientAddress: string;
  selectedBurnerLabel?: string;
  selectedBurnerBalance: number;
  transferStatus: 'idle' | 'success' | 'error';
  transferLoading: boolean;
  onRecipientChange: (address: string) => void;
  onSweep: () => void;
  onBack: () => void;
}

export function TransferView({
  recipientAddress,
  selectedBurnerLabel,
  selectedBurnerBalance,
  transferStatus,
  transferLoading,
  onRecipientChange,
  onSweep,
  onBack,
}: TransferViewProps) {
  return (
    <div className="max-w-md mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl sm:text-4xl">
            💸
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Sweep Burner</h2>
          <p className="text-muted-foreground text-sm">
            Transfer all funds to any address.
          </p>
        </div>

        {transferStatus === 'success' ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-5xl sm:text-6xl mb-4">✅</div>
            <p className="text-xl sm:text-2xl font-bold text-primary">Done!</p>
            <p className="text-muted-foreground mt-2">Redirecting...</p>
          </div>
        ) : transferStatus === 'error' ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-5xl sm:text-6xl mb-4">❌</div>
            <p className="text-xl sm:text-2xl font-bold text-red-400">Failed</p>
            <p className="text-muted-foreground mt-2">Please try again</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => onRecipientChange(e.target.value)}
                placeholder="Enter Solana address..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-primary mb-2 font-medium">Summary</p>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">From:</span>
                <span className="font-mono truncate max-w-[150px] sm:max-w-none">{selectedBurnerLabel}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm mt-2">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-primary font-bold">
                  {formatSOL(selectedBurnerBalance)} SOL
                </span>
              </div>
            </div>

            <button
              onClick={onSweep}
              disabled={!recipientAddress || transferLoading}
              className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {transferLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Sweeping...
                </>
              ) : (
                '💸 Sweep All'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
