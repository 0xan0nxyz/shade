'use client';

import { useState, useCallback } from 'react';
import { getNetwork } from '@/lib/solana';
import { NETWORKS } from '@/lib/constants';

interface TransactionDetails {
  action?: string;
  amount?: number;
  recipient?: string;
}

interface MainnetConfirmState {
  isOpen: boolean;
  title: string;
  details?: TransactionDetails;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Hook for managing mainnet transaction confirmations
 *
 * Usage:
 * ```tsx
 * const { dialogState, requireMainnetConfirmation } = useMainnetConfirm();
 *
 * const handleSweep = async () => {
 *   const confirmed = await requireMainnetConfirmation('Sweep Funds', {
 *     action: 'Sweep to destination',
 *     amount: 1.5,
 *     recipient: 'abc...xyz'
 *   });
 *   if (!confirmed) return;
 *   // proceed with sweep
 * };
 *
 * return (
 *   <>
 *     <MainnetConfirmDialog {...dialogState} />
 *     <button onClick={handleSweep}>Sweep</button>
 *   </>
 * );
 * ```
 */
export function useMainnetConfirm() {
  const [dialogState, setDialogState] = useState<MainnetConfirmState>({
    isOpen: false,
    title: '',
    details: undefined,
    onConfirm: () => {},
    onCancel: () => {},
  });

  /**
   * Request mainnet confirmation if on mainnet
   * Returns true if confirmed or not on mainnet, false if cancelled
   */
  const requireMainnetConfirmation = useCallback(
    (title: string, details?: TransactionDetails): Promise<boolean> => {
      return new Promise((resolve) => {
        const network = getNetwork();
        const networkConfig = NETWORKS[network];

        // If not on mainnet, auto-confirm
        if (!networkConfig.isMainnet) {
          resolve(true);
          return;
        }

        // Show confirmation dialog
        setDialogState({
          isOpen: true,
          title,
          details,
          onConfirm: () => {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
        });
      });
    },
    []
  );

  /**
   * Check if current network is mainnet
   */
  const isMainnet = useCallback(() => {
    const network = getNetwork();
    return NETWORKS[network].isMainnet;
  }, []);

  return {
    dialogState,
    requireMainnetConfirmation,
    isMainnet,
  };
}
