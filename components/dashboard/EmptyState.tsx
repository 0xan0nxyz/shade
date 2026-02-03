'use client';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center border border-white/5">
      <div className="text-5xl sm:text-6xl mb-4 sm:mb-5">🔥</div>
      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">No Burners Yet</h3>
      <p className="text-muted-foreground text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm mx-auto">
        Create your first burner wallet to compartmentalize your on-chain activity.
      </p>
      <button
        onClick={onCreateClick}
        className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-primary text-primary-foreground font-medium sm:font-semibold hover:bg-primary/90 transition-all text-sm sm:text-base"
      >
        Create First Burner
      </button>
    </div>
  );
}
