'use client';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mb-4 sm:mb-6 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors text-sm sm:text-base"
    >
      ← {label}
    </button>
  );
}
