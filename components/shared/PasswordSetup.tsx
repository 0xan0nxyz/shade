'use client';

import { useState, useEffect } from 'react';
import { BackButton } from './';
import { initializeStorage, unlockStorage } from '@/lib/storage';

interface PasswordSetupProps {
  onUnlocked: () => void;
  onCancel: () => void;
}

export function PasswordSetup({ onUnlocked, onCancel }: PasswordSetupProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewSetup, setIsNewSetup] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      const init = await initializeStorage();
      setIsNewSetup(!init.needsPassword);
    };
    checkSetup();
  }, []);

  const handleSubmit = async () => {
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isNewSetup && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const success = await unlockStorage(password);
    setLoading(false);

    if (success) {
      onUnlocked();
    } else {
      setError(isNewSetup ? 'Failed to setup encryption' : 'Incorrect password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-[#0a0a0f] border border-primary/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-primary/10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl">
            🔒
          </div>
          <h2 className="text-xl font-bold mb-2">
            {isNewSetup ? 'Setup SHADE Wallet' : 'Unlock SHADE Wallet'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isNewSetup
              ? 'Create a master password to encrypt your wallet keys. This password cannot be recovered.'
              : 'Enter your master password to unlock your wallet.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isNewSetup) {
                  handleSubmit();
                }
              }}
            />
          </div>

          {!isNewSetup && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>{isNewSetup ? 'Setting up...' : 'Unlocking...'}</span>
              </>
            ) : (
              <>
                <span>🔓</span>
                <span>{isNewSetup ? 'Create Wallet' : 'Unlock'}</span>
              </>
            )}
          </button>

          {isNewSetup && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              ⚠️ Store your password safely. It cannot be recovered and is needed to access your funds.
            </div>
          )}
        </div>

        <button
          onClick={onCancel}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
