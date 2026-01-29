'use client';

import { BackButton } from '../shared';
import { formatAddress } from '@/lib/utils';

interface StealthAddress {
  index: number;
  label: string;
  address: string;
  spent: boolean;
}

interface MetaAddress {
  scanPubkey: string;
  spendPubkey: string;
}

interface StealthViewProps {
  stealthPassword: string;
  stealthInitialized: boolean;
  stealthAddresses: StealthAddress[];
  metaAddress: MetaAddress | null;
  onPasswordChange: (password: string) => void;
  onInitialize: () => void;
  onGenerate: () => void;
  onSweep: (index: number) => void;
  onBack: () => void;
}

export function StealthView({
  stealthPassword,
  stealthInitialized,
  stealthAddresses,
  metaAddress,
  onPasswordChange,
  onInitialize,
  onGenerate,
  onSweep,
  onBack,
}: StealthViewProps) {
  return (
    <div className="max-w-lg mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-3xl sm:text-4xl">
            👻
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Stealth Addresses</h2>
          <p className="text-muted-foreground text-sm">
            One-time addresses for unlinkable private payments.
          </p>
        </div>

        {!stealthInitialized ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Set Stealth Password
              </label>
              <input
                type="password"
                value={stealthPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={onInitialize}
              disabled={stealthPassword.length < 6}
              className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              🔐 Initialize Stealth Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Meta Address Display */}
            {metaAddress && (
              <div className="p-3 sm:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-400 mb-2">Your Meta Address</p>
                <p className="font-mono text-xs break-all">{metaAddress.scanPubkey}</p>
                <p className="font-mono text-xs break-all mt-1">{metaAddress.spendPubkey}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={onGenerate}
              className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
              <span className="text-xl">👻</span>
              <span className="text-sm sm:text-base font-semibold">Generate Stealth Address</span>
            </button>

            {/* Stealth Addresses List */}
            {stealthAddresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Generated Addresses</p>
                {stealthAddresses.map((addr) => (
                  <div key={addr.index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{addr.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">{formatAddress(addr.address, 8)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {addr.spent ? (
                          <span className="text-xs text-red-400">Spent</span>
                        ) : (
                          <button
                            onClick={() => onSweep(addr.index)}
                            className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400"
                          >
                            Sweep
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
