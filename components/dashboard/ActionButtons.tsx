'use client';

import { Flame, Shield, Ghost, Lock, Zap, ExternalLink, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'dashboard' | 'transfer' | 'create' | 'backup' | 'stealth' | 'passkey' | 'gasless' | 'connect';

interface ActionButtonsProps {
  onViewChange: (view: ViewMode) => void;
  onAirdropRequest: () => void;
}

interface ActionButton {
  view: ViewMode | 'airdrop';
  icon: React.ReactNode;
  label: string;
  description: string;
  variant: 'primary' | 'secondary' | 'accent' | 'danger';
}

const actions: ActionButton[] = [
  {
    view: 'create',
    icon: <Flame className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Create',
    description: 'New burner',
    variant: 'primary',
  },
  {
    view: 'backup',
    icon: <Shield className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Backup',
    description: 'Export keys',
    variant: 'secondary',
  },
  {
    view: 'stealth',
    icon: <Ghost className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Stealth',
    description: 'Anonymous',
    variant: 'accent',
  },
  {
    view: 'passkey',
    icon: <Lock className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Passkey',
    description: 'Biometric',
    variant: 'accent',
  },
  {
    view: 'gasless',
    icon: <Zap className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Gasless',
    description: 'Prepaid',
    variant: 'accent',
  },
  {
    view: 'connect',
    icon: <ExternalLink className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Connect',
    description: 'Wallet',
    variant: 'secondary',
  },
  {
    view: 'airdrop',
    icon: <Droplets className="w-4 h-4" strokeWidth={1.5} />,
    label: 'Faucet',
    description: 'Get SOL',
    variant: 'accent',
  },
];

const variantStyles = {
  primary: 'border-primary/30 hover:border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary',
  secondary: 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-foreground',
  accent: 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-foreground',
  danger: 'border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400',
};

export function ActionButtons({ onViewChange, onAirdropRequest }: ActionButtonsProps) {
  const handleClick = (action: ActionButton) => {
    if (action.view === 'airdrop') {
      onAirdropRequest();
    } else {
      onViewChange(action.view);
    }
  };

  return (
    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 mb-8 sm:mb-10 max-w-3xl mx-auto">
      {actions.map((action) => (
        <Button
          key={action.view}
          onClick={() => handleClick(action)}
          variant="outline"
          className={`
            glass rounded-xl p-2.5 sm:p-4 h-auto flex flex-col items-center justify-center gap-1.5 sm:gap-3
            transition-all duration-200
            ${variantStyles[action.variant]}
          `}
        >
          <div className="p-1.5 sm:p-2 rounded-lg bg-black/20">{action.icon}</div>
          <div className="text-center">
            <p className="font-semibold text-xs sm:text-sm">{action.label}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide font-medium hidden xs:block">
              {action.description}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
}
