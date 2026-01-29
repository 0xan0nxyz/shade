'use client';

import { BackButton } from '../shared';
import { ConnectedWallet, WalletAdapter } from '@/lib/wallet-connection';

interface ConnectWalletViewProps {
  connectedWallet: ConnectedWallet | null;
  walletBalance: number;
  walletConnecting: boolean;
  isWalletInstalled: boolean;
  availableWallets: WalletAdapter[];
  onConnect: () => void;
  onDisconnect: () => void;
  onBack: () => void;
}

export function ConnectWalletView({
  connectedWallet,
  walletBalance,
  walletConnecting,
  isWalletInstalled,
  availableWallets,
  onConnect,
  onDisconnect,
  onBack,
}: ConnectWalletViewProps) {
  return (
    <div className="max-w-lg mx-auto">
      <BackButton onClick={onBack} />

      <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/5">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl sm:text-4xl">
            🔗
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground text-sm">
            Connect Phantom or Solflare to use your existing wallet.
          </p>
        </div>

        {connectedWallet ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👻</span>
                <div>
                  <p className="font-medium capitalize">{connectedWallet.adapter}</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <p className="font-mono text-sm bg-white/5 p-2 rounded">
                {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-8)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-2xl font-bold text-indigo-400">{walletBalance.toFixed(4)} SOL</p>
            </div>

            <button
              onClick={onDisconnect}
              className="w-full py-3 sm:py-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm"
            >
              🔌 Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {isWalletInstalled ? (
              <div className="space-y-3">
                {availableWallets.map((wallet) => (
                  <button
                    key={wallet}
                    onClick={onConnect}
                    disabled={walletConnecting}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all flex items-center justify-between px-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {wallet === 'phantom' ? '👻' : '☀️'}
                      </span>
                      <span className="font-medium capitalize">{wallet}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                      Available
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">👻 ☀️</div>
                <p className="text-muted-foreground mb-4">
                  No wallet extension detected
                </p>
                <div className="space-y-2 text-sm">
                  <p>Install Phantom or Solflare:</p>
                  <div className="flex justify-center gap-4">
                    <a
                      href="https://phantom.com/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Phantom
                    </a>
                    <a
                      href="https://solflare.com/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Solflare
                    </a>
                  </div>
                </div>
              </div>
            )}

            {walletConnecting && (
              <div className="text-center py-4">
                <span className="animate-spin text-2xl">⟳</span>
                <p className="text-sm text-muted-foreground mt-2">Connecting...</p>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-muted-foreground text-center">
            💡 Your private keys stay in your wallet extension. SHADE never sees them.
          </p>
        </div>
      </div>
    </div>
  );
}
