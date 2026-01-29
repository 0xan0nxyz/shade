'use client';

import { BackButton } from '../shared';

interface CreateViewProps {
  loading: boolean;
  onBack: () => void;
  onCreate: () => void;
}

export function CreateView({ loading, onBack, onCreate }: CreateViewProps) {
  return (
    <div className="max-w-md mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl sm:text-4xl">
            🔥
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">New Burner</h2>
          <p className="text-muted-foreground text-sm">
            Disposable wallet with zero on-chain link to your identity.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs sm:text-sm">
              <span className="text-lg">✓</span>
              <span>Generated locally - keys never leave device</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs sm:text-sm">
              <span className="text-lg">✓</span>
              <span>Encrypted with AES-GCM in browser</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <span className="text-lg">✓</span>
              <span>Complete anonymity - no link to main wallet</span>
            </div>
          </div>
        </div>

        <button
          onClick={onCreate}
          disabled={loading}
          className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {loading ? (
            <>
              <span className="animate-spin">⟳</span>
              Generating...
            </>
          ) : (
            '🔥 Generate Burner'
          )}
        </button>
      </div>
    </div>
  );
}
