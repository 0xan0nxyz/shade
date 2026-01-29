'use client';

type ViewMode = 'dashboard' | 'transfer' | 'create' | 'backup' | 'stealth' | 'passkey' | 'gasless' | 'connect';

interface ActionButtonsProps {
  onViewChange: (view: ViewMode) => void;
  onAirdropRequest: () => void;
}

interface ActionButton {
  view: ViewMode | 'airdrop';
  icon: string;
  label: string;
  bgClass: string;
  borderClass: string;
}

const actions: ActionButton[] = [
  { view: 'create', icon: '🔥', label: 'Create', bgClass: 'bg-gradient-to-r from-primary/15 to-accent/15', borderClass: 'border-primary/25 hover:border-primary/45' },
  { view: 'backup', icon: '💾', label: 'Backup', bgClass: 'bg-white/5', borderClass: 'border-white/10 hover:border-white/20' },
  { view: 'stealth', icon: '👻', label: 'Stealth', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/20 hover:border-purple-500/40' },
  { view: 'passkey', icon: '🔐', label: 'Passkey', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20 hover:border-emerald-500/40' },
  { view: 'gasless', icon: '💸', label: 'Gasless', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20 hover:border-amber-500/40' },
  { view: 'connect', icon: '🔗', label: 'Connect', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/20 hover:border-indigo-500/40' },
  { view: 'airdrop', icon: '💧', label: 'Faucet', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20 hover:border-blue-500/40' },
];

export function ActionButtons({ onViewChange, onAirdropRequest }: ActionButtonsProps) {
  const handleClick = (action: ActionButton) => {
    if (action.view === 'airdrop') {
      onAirdropRequest();
    } else {
      onViewChange(action.view);
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
      {actions.map((action) => (
        <button
          key={action.view}
          onClick={() => handleClick(action)}
          className={`py-3 sm:py-4 rounded-xl ${action.bgClass} border ${action.borderClass} transition-all flex items-center justify-center gap-2`}
        >
          <span className="text-xl sm:text-2xl">{action.icon}</span>
          <span className="text-sm sm:text-base font-semibold">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
