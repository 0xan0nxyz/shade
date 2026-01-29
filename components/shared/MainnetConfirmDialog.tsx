'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';

interface MainnetConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  details?: {
    action?: string;
    amount?: number;
    recipient?: string;
  };
}

const CONFIRM_DELAY_MS = 3000;

export function MainnetConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Mainnet Transaction',
  details,
}: MainnetConfirmDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [countdown, setCountdown] = useState(CONFIRM_DELAY_MS / 1000);
  const [canConfirm, setCanConfirm] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAcknowledged(false);
      setCanConfirm(false);
      setCountdown(CONFIRM_DELAY_MS / 1000);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (acknowledged && canConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-[#0a0a0f] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-red-500/10">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-white mb-2">
          {title}
        </h2>

        {/* Warning Message */}
        <p className="text-center text-red-400 text-sm mb-4">
          You are about to perform a transaction on <strong>Mainnet</strong>.
          <br />
          This will use <strong>REAL SOL</strong> with real value.
        </p>

        {/* Transaction Details */}
        {details && (
          <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2">
            {details.action && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Action:</span>
                <span className="text-white">{details.action}</span>
              </div>
            )}
            {details.amount !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-white font-mono">{details.amount.toFixed(4)} SOL</span>
              </div>
            )}
            {details.recipient && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="text-white font-mono text-xs">
                  {details.recipient.slice(0, 8)}...{details.recipient.slice(-8)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Acknowledgment Checkbox */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-red-500/50 bg-transparent text-red-500 focus:ring-red-500/50"
          />
          <span className="text-sm text-muted-foreground">
            I understand this transaction uses real SOL on Mainnet and is irreversible.
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleConfirm}
            disabled={!acknowledged || !canConfirm}
          >
            {!canConfirm ? `Wait ${countdown}s` : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
