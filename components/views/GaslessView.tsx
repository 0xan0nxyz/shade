'use client';

import { BackButton } from '../shared';

interface GaslessStats {
  configured: boolean;
  prepaidCount: number;
  totalPrepaidSol: number;
}

interface PrepaidBurner {
  id: string;
  address: string;
}

interface GaslessViewProps {
  feePayerAddress: string;
  gaslessStats: GaslessStats;
  gaslessLoading: boolean;
  prepaidBurners: PrepaidBurner[];
  onFeePayerChange: (address: string) => void;
  onCreatePrepaid: () => void;
  onDeletePrepaid: (id: string) => void;
  onClearConfig: () => void;
  onBack: () => void;
}

export function GaslessView({
  feePayerAddress,
  gaslessStats,
  gaslessLoading,
  prepaidBurners,
  onFeePayerChange,
  onCreatePrepaid,
  onDeletePrepaid,
  onClearConfig,
  onBack,
}: GaslessViewProps) {
  return (
    <div className="max-w-lg mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-3xl sm:text-4xl">
            💸
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Gasless Transactions</h2>
          <p className="text-muted-foreground text-sm">
            Pay transaction fees from a separate address you control.
          </p>
        </div>

        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{gaslessStats.prepaidCount}</p>
              <p className="text-xs text-muted-foreground">Prepaid Burners</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{gaslessStats.totalPrepaidSol.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Total Prepaid SOL</p>
            </div>
          </div>

          {/* Fee Payer Input */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Fee Payer Address
            </label>
            <input
              type="text"
              value={feePayerAddress}
              onChange={(e) => onFeePayerChange(e.target.value)}
              placeholder="Enter Solana address..."
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/50 focus:bg-white/10 outline-none transition-all text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              This address will pay for your transaction fees.
            </p>
          </div>

          {/* Create Prepaid Burner */}
          <button
            onClick={onCreatePrepaid}
            disabled={gaslessLoading}
            className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {gaslessLoading ? 'Creating...' : '➕ Create Prepaid Burner'}
          </button>

          {/* Prepaid Burners List */}
          {prepaidBurners.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your Prepaid Burners</p>
              {prepaidBurners.map((burner) => (
                <div key={burner.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono text-xs">{burner.address.slice(0, 12)}...{burner.address.slice(-8)}</p>
                      <p className="text-xs text-muted-foreground">ID: {burner.id}</p>
                    </div>
                    <button
                      onClick={() => onDeletePrepaid(burner.id)}
                      className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clear Config */}
          <button
            onClick={onClearConfig}
            className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm text-red-400"
          >
            🗑️ Clear Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
