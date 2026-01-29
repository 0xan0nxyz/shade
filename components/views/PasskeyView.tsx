'use client';

import { BackButton } from '../shared';

interface PasskeyViewProps {
  passkeyAvailable: boolean;
  hasWallet: boolean;
  passkeyLoading: boolean;
  username: string;
  onUsernameChange: (username: string) => void;
  onCreateWallet: () => void;
  onAuthenticate: () => void;
  onDeleteWallet: () => void;
  onBack: () => void;
}

export function PasskeyView({
  passkeyAvailable,
  hasWallet,
  passkeyLoading,
  username,
  onUsernameChange,
  onCreateWallet,
  onAuthenticate,
  onDeleteWallet,
  onBack,
}: PasskeyViewProps) {
  return (
    <div className="max-w-lg mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-3xl sm:text-4xl">
            🔐
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Passkey Wallet</h2>
          <p className="text-muted-foreground text-sm">
            Biometric authentication - no seed phrases.
          </p>
        </div>

        {!passkeyAvailable ? (
          <div className="text-center py-6">
            <p className="text-yellow-400 mb-4">Passkeys not available on this device</p>
            <p className="text-sm text-muted-foreground">Use a device with biometric authentication (FaceID, TouchID, Windows Hello)</p>
          </div>
        ) : hasWallet ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-emerald-400 font-medium mb-2">✅ Passkey Wallet Active</p>
              <p className="text-xs text-muted-foreground">Your wallet is protected with biometric authentication</p>
            </div>

            <button
              onClick={onAuthenticate}
              disabled={passkeyLoading}
              className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {passkeyLoading ? 'Verifying...' : '🔓 Authenticate'}
            </button>

            <button
              onClick={onDeleteWallet}
              className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm text-red-400"
            >
              🗑️ Delete Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all text-sm"
              />
            </div>

            <button
              onClick={onCreateWallet}
              disabled={!username || passkeyLoading}
              className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {passkeyLoading ? 'Creating...' : '🔐 Create Passkey Wallet'}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Your passkey is stored securely on your device. No seed phrase to lose.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
