'use client';

import { useState, useEffect, useRef } from 'react';
import { useBurners, useNetwork, useMainnetConfirm } from '@/hooks';
import {
  StatsCards,
  ActionButtons,
  BurnerCard,
  EmptyState,
  CreateView,
  BackupView,
  TransferView,
  StealthView,
  PasskeyView,
  GaslessView,
  ConnectWalletView,
} from '@/components';
import { MainnetConfirmDialog, PasswordSetup } from '@/components/shared';
import { initializeStorage, unlockStorage, isStorageReady } from '@/lib/storage';
import { exportBurners, downloadBackup, importBurners, destroyBurner } from '@/lib/burner';
import { exportCompleteWallet, importCompleteWallet, getBackupSummary, downloadBackup as downloadCompleteBackup } from '@/lib/backup';
import { generateStealthAddress, getStealthAddresses, sweepStealthAddress, getStealthMetaAddress, isStealthInitialized } from '@/lib/stealth';
import { createPasskeyWallet, authenticateWithPasskey, hasPasskeyWallet, deletePasskeyWallet, isPasskeyAvailable } from '@/lib/passkey';
import { setFeePayerAddress, getFeePayerAddress, createPrepaidBurner, getPrepaidBurners, deletePrepaidBurner, getGaslessStats, clearGaslessConfig } from '@/lib/gasless';
import { connectWallet, disconnectWallet, getWalletBalance, isWalletInstalled, getAvailableWallets, getConnectedWallet, ConnectedWallet, WalletAdapter } from '@/lib/wallet-connection';
import { Network } from '@/lib/constants';

type ViewMode = 'dashboard' | 'transfer' | 'create' | 'backup' | 'stealth' | 'passkey' | 'gasless' | 'connect';

export default function Home() {
  // Core hooks
  const { burners, loading, totalBalance, loadBurners, createBurner } = useBurners();
  const { network, setNetwork, airdropStatus, handleRequestAirdrop } = useNetwork();
  const { dialogState, requireMainnetConfirmation } = useMainnetConfirm();

  // Refs to prevent duplicate initialization
  const storageInitialized = useRef(false);
  const walletChecked = useRef(false);

  // View state
  const [view, setView] = useState<ViewMode>('dashboard');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedBurnerId, setSelectedBurnerId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Transfer state
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Backup state
  const [backupPassword, setBackupPassword] = useState('');
  const [importJson, setImportJson] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [backupSummary, setBackupSummary] = useState<{
    burners: number;
    stealthAddresses: number;
    gaslessBurners: number;
    hasStealthSeed: boolean;
    hasFeePayerConfig: boolean;
  } | null>(null);

  // Stealth state
  const [stealthPassword, setStealthPassword] = useState('');
  const [stealthAddresses, setStealthAddresses] = useState<any[]>([]);
  const [metaAddress, setMetaAddress] = useState<any>(null);
  const [stealthInitialized, setStealthInitialized] = useState(false);

  // Passkey state
  const [passkeyAvailable, setPasskeyAvailable] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [username, setUsername] = useState('');

  // Gasless state
  const [feePayerAddress, setFeePayerAddressState] = useState('');
  const [gaslessStats, setGaslessStats] = useState({ configured: false, prepaidCount: 0, totalPrepaidSol: 0 });
  const [gaslessLoading, setGaslessLoading] = useState(false);

  // Wallet connection state
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletConnecting, setWalletConnecting] = useState(false);

  // Storage unlock state
  const [storageUnlocked, setStorageUnlocked] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize passkey and gasless
  useEffect(() => {
    if (storageInitialized.current) return;

    const init = async () => {
      setPasskeyAvailable(await isPasskeyAvailable());
      setHasWallet(hasPasskeyWallet());
      setGaslessStats(await getGaslessStats());
      setFeePayerAddressState(getFeePayerAddress() || '');

      // Initialize storage
      const storageInit = await initializeStorage();
      setStorageUnlocked(isStorageReady());
      storageInitialized.current = true;
    };
    init();
  }, []);

  // Load backup summary when entering backup view
  useEffect(() => {
    if (view === 'backup') {
      getBackupSummary().then(setBackupSummary);
    }
  }, [view]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    if (walletChecked.current) return;

    const checkExistingConnection = async () => {
      const existing = await getConnectedWallet();
      if (existing) {
        setConnectedWallet(existing);
        setWalletBalance(await getWalletBalance(existing.address));
      }
      walletChecked.current = true;
    };
    checkExistingConnection();
  }, []);

  // Refresh wallet balance when network changes
  useEffect(() => {
    if (!connectedWallet) return;

    const refreshBalance = async () => {
      try {
        const balance = await getWalletBalance(connectedWallet.address);
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to refresh balance on network change:', error);
      }
    };

    refreshBalance();
  }, [network]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh wallet balance periodically when connected
  useEffect(() => {
    if (!connectedWallet) return;

    const refreshBalance = async () => {
      try {
        const balance = await getWalletBalance(connectedWallet.address);
        setWalletBalance(balance);
      } catch (error) {
        console.error('Failed to refresh wallet balance:', error);
      }
    };

    // Initial refresh
    refreshBalance();

    // Refresh every 10 seconds
    const interval = setInterval(refreshBalance, 10000);

    return () => clearInterval(interval);
  }, [connectedWallet?.address]); // Only refresh when address changes

  // Handlers
  const handleCreateBurner = async () => {
    // Check if storage is unlocked
    if (!storageUnlocked) {
      setShowPasswordSetup(true);
      return;
    }

    const label = `BURNER_${String(burners.length + 1).padStart(3, '0')}`;
    await createBurner(label);
    setView('dashboard');
  };

  const handlePasswordUnlocked = () => {
    setStorageUnlocked(true);
    setShowPasswordSetup(false);
  };

  const handleSweep = async () => {
    if (!recipientAddress || !selectedBurnerId) return;

    // Require mainnet confirmation
    const confirmed = await requireMainnetConfirmation('Sweep Burner Funds', {
      action: 'Sweep all funds',
      amount: selectedBurner?.balance || 0,
      recipient: recipientAddress,
    });
    if (!confirmed) return;

    setTransferLoading(true);
    try {
      const { sweepBurner } = await import('@/lib/burner');
      await sweepBurner(selectedBurnerId, recipientAddress);
      setTransferStatus('success');
      setTimeout(() => {
        setView('dashboard');
        setRecipientAddress('');
        loadBurners();
      }, 2000);
    } catch {
      setTransferStatus('error');
    }
    setTransferLoading(false);
  };

  const handleDestroy = async (id: string) => {
    if (!confirm('🔥 DESTROY BURNER?\n\nThis will permanently delete this burner. Any remaining funds will be LOST.\n\nAre you sure?')) return;
    await destroyBurner(id);
    loadBurners();
  };

  const handleExportBackup = async () => {
    if (!backupPassword || backupPassword.length < 6) {
      setBackupStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    const backup = await exportBurners(backupPassword);
    if (backup) {
      downloadBackup(backup);
      setBackupStatus({ type: 'success', message: `Exported ${backup.burners.length} burners!` });
    } else {
      setBackupStatus({ type: 'error', message: 'Failed to export burners' });
    }
  };

  const handleExportCompleteBackup = async () => {
    if (!backupPassword || backupPassword.length < 6) {
      setBackupStatus({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }
    const result = await exportCompleteWallet();
    if (result.success && result.backup) {
      downloadCompleteBackup(result.backup);
      const parts = [];
      if (result.includedSections.burners > 0) parts.push(`${result.includedSections.burners} burners`);
      if (result.includedSections.stealthAddresses > 0) parts.push(`${result.includedSections.stealthAddresses} stealth addresses`);
      if (result.includedSections.gaslessBurners > 0) parts.push(`${result.includedSections.gaslessBurners} prepaid burners`);
      setBackupStatus({ type: 'success', message: `Exported: ${parts.join(', ')}` });
    } else {
      setBackupStatus({ type: 'error', message: 'Failed to export wallet data' });
    }
  };

  const handleImportBackup = async () => {
    if (!importJson.trim() || !backupPassword || backupPassword.length < 6) {
      setBackupStatus({ type: 'error', message: 'Paste your backup JSON and enter password' });
      return;
    }
    // Use complete import which handles both v2 (burners only) and v3 (complete) formats
    const result = await importCompleteWallet(importJson);
    if (result.success) {
      const parts = [];
      if (result.imported.burners > 0) parts.push(`${result.imported.burners} burners`);
      if (result.imported.stealthAddresses > 0) parts.push(`${result.imported.stealthAddresses} stealth addresses`);
      if (result.imported.gaslessBurners > 0) parts.push(`${result.imported.gaslessBurners} prepaid burners`);
      setBackupStatus({ type: 'success', message: `Imported: ${parts.join(', ')}` });
      setImportJson('');
      loadBurners();
      getBackupSummary().then(setBackupSummary);
      setTimeout(() => setView('dashboard'), 1500);
    } else {
      setBackupStatus({ type: 'error', message: result.errors[0] || 'Import failed' });
    }
  };

  const handleStealthInit = async () => {
    if (stealthPassword.length < 6) return alert('Password must be at least 6 characters');
    const initialized = await isStealthInitialized(stealthPassword);
    if (initialized) {
      setStealthInitialized(true);
      setStealthAddresses(getStealthAddresses());
      setMetaAddress(await getStealthMetaAddress(stealthPassword));
    }
  };

  const handleStealthGenerate = async () => {
    await generateStealthAddress(stealthPassword);
    setStealthAddresses(getStealthAddresses());
  };

  const handleStealthSweep = async (index: number) => {
    const dest = prompt('Enter destination address:');
    if (!dest) return;

    // Require mainnet confirmation
    const confirmed = await requireMainnetConfirmation('Sweep Stealth Address', {
      action: 'Sweep stealth funds',
      recipient: dest,
    });
    if (!confirmed) return;

    await sweepStealthAddress(index, stealthPassword, dest);
    setStealthAddresses(getStealthAddresses());
  };

  const handlePasskeyCreate = async () => {
    if (!username) return alert('Please enter a username');
    setPasskeyLoading(true);
    const wallet = await createPasskeyWallet(username);
    setPasskeyLoading(false);
    if (wallet) {
      setHasWallet(true);
      alert('Passkey wallet created!');
    }
  };

  const handlePasskeyAuth = async () => {
    setPasskeyLoading(true);
    const success = await authenticateWithPasskey();
    setPasskeyLoading(false);
    alert(success ? 'Authenticated successfully!' : 'Authentication failed');
  };

  const handlePasskeyDelete = async () => {
    if (confirm('Delete passkey wallet? This cannot be undone.')) {
      await deletePasskeyWallet();
      setHasWallet(false);
    }
  };

  const handleGaslessCreate = async () => {
    setGaslessLoading(true);
    const burner = await createPrepaidBurner('Gas Prepaid');
    setGaslessLoading(false);
    if (burner) {
      setGaslessStats(await getGaslessStats());
      alert(`Created prepaid burner: ${burner.address.slice(0, 8)}...`);
    }
  };

  const handleGaslessClear = () => {
    if (confirm('Clear all gasless configuration?')) {
      clearGaslessConfig();
      setFeePayerAddressState('');
      setGaslessStats({ configured: false, prepaidCount: 0, totalPrepaidSol: 0 });
    }
  };

  const handleWalletConnect = async () => {
    setWalletConnecting(true);
    try {
      const walletData = await connectWallet();
      if (walletData) {
        setConnectedWallet(walletData);
        setWalletBalance(await getWalletBalance(walletData.address));
      }
    } catch (e) {
      alert('Failed to connect: ' + e);
    }
    setWalletConnecting(false);
  };

  const handleWalletDisconnect = async () => {
    if (connectedWallet?.adapter !== 'unknown') await disconnectWallet(connectedWallet!.adapter);
    setConnectedWallet(null);
    setWalletBalance(0);
  };

  const selectedBurner = burners.find(b => b.id === selectedBurnerId);

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans">
      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <PasswordSetup
          onUnlocked={handlePasswordUnlocked}
          onCancel={() => setShowPasswordSetup(false)}
        />
      )}

      {/* Mainnet Confirmation Dialog */}
      <MainnetConfirmDialog {...dialogState} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/5 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Navbar */}
      <nav className="relative border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm sm:text-lg shadow-lg shadow-primary/20">S</div>
            <div className="hidden xs:block">
              <h1 className="text-base sm:text-xl font-bold tracking-tight">SHADE</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Privacy Wallet</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <NetworkSelector network={network} onNetworkChange={setNetwork} />
            <button onClick={() => handleRequestAirdrop(burners[0]?.publicKey || '')} className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-xs sm:text-sm transition-all flex items-center gap-1 whitespace-nowrap">
              <span className="text-sm">💧</span><span className="hidden sm:inline">Faucet</span>
            </button>
            {/* Phantom Connect Button */}
            {connectedWallet ? (
              <button
                onClick={() => setView('connect')}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 text-xs sm:text-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className="text-sm">👻</span>
                <span className="font-mono hidden xs:inline">{connectedWallet.address.slice(0, 4)}...{connectedWallet.address.slice(-4)}</span>
                <span className="text-purple-300">({walletBalance.toFixed(2)} SOL)</span>
              </button>
            ) : (
              <button
                onClick={() => isWalletInstalled() ? handleWalletConnect() : alert('Please install Phantom wallet')}
                disabled={walletConnecting}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 text-xs sm:text-sm transition-all flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
              >
                <span className="text-sm">👻</span>
                <span className="hidden sm:inline">{walletConnecting ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {airdropStatus && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-center animate-fade-in text-sm">
            <p className="text-primary">{airdropStatus}</p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 px-2">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">Burn Smart.</span>
            <br /><span className="text-foreground text-xl sm:text-2xl md:text-3xl">Stay Anonymous.</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-xl mx-auto px-4">Privacy-first burner wallet manager for Solana. Generate disposable wallets instantly with zero on-chain link to your identity.</p>
        </div>

        <StatsCards burnerCount={burners.length} totalBalance={totalBalance} network={network} />
        <ActionButtons onViewChange={setView} onAirdropRequest={() => handleRequestAirdrop(burners[0]?.publicKey || '')} />

        {/* Views */}
        {view === 'dashboard' && (
          burners.length === 0 ? <EmptyState onCreateClick={() => setView('create')} /> : (
            <div className="space-y-2 sm:space-y-3">
              {burners.map(burner => (
                <BurnerCard key={burner.id} burner={burner} isExpanded={expandedId === burner.id} isMobile={isMobile}
                  onToggleExpand={() => setExpandedId(expandedId === burner.id ? null : burner.id)}
                  onCopy={() => navigator.clipboard.writeText(burner.publicKey)}
                  onSweep={() => { setSelectedBurnerId(burner.id); setView('transfer'); }}
                  onDestroy={() => handleDestroy(burner.id)} />
              ))}
            </div>
          )
        )}

        {view === 'create' && <CreateView loading={loading} onBack={() => setView('dashboard')} onCreate={handleCreateBurner} />}
        {view === 'backup' && <BackupView backupPassword={backupPassword} importJson={importJson} backupStatus={backupStatus} burnerCount={burners.length} onPasswordChange={setBackupPassword} onImportJsonChange={setImportJson} onExport={handleExportBackup} onExportComplete={handleExportCompleteBackup} onImport={handleImportBackup} onBack={() => { setView('dashboard'); setBackupStatus(null); }} backupSummary={backupSummary} />}
        {view === 'transfer' && <TransferView recipientAddress={recipientAddress} selectedBurnerLabel={selectedBurner?.label} selectedBurnerBalance={selectedBurner?.balance || 0} transferStatus={transferStatus} transferLoading={transferLoading} onRecipientChange={setRecipientAddress} onSweep={handleSweep} onBack={() => { setView('dashboard'); setTransferStatus('idle'); }} />}
        {view === 'stealth' && <StealthView stealthPassword={stealthPassword} stealthInitialized={stealthInitialized} stealthAddresses={stealthAddresses} metaAddress={metaAddress} onPasswordChange={setStealthPassword} onInitialize={handleStealthInit} onGenerate={handleStealthGenerate} onSweep={handleStealthSweep} onBack={() => setView('dashboard')} />}
        {view === 'passkey' && <PasskeyView passkeyAvailable={passkeyAvailable} hasWallet={hasWallet} passkeyLoading={passkeyLoading} username={username} onUsernameChange={setUsername} onCreateWallet={handlePasskeyCreate} onAuthenticate={handlePasskeyAuth} onDeleteWallet={handlePasskeyDelete} onBack={() => setView('dashboard')} />}
        {view === 'gasless' && <GaslessView feePayerAddress={feePayerAddress} gaslessStats={gaslessStats} gaslessLoading={gaslessLoading} prepaidBurners={getPrepaidBurners()} onFeePayerChange={(addr) => { setFeePayerAddressState(addr); setFeePayerAddress(addr); }} onCreatePrepaid={handleGaslessCreate} onDeletePrepaid={(id) => { deletePrepaidBurner(id); getGaslessStats().then(setGaslessStats); }} onClearConfig={handleGaslessClear} onBack={() => setView('dashboard')} />}
        {view === 'connect' && <ConnectWalletView connectedWallet={connectedWallet} walletBalance={walletBalance} walletConnecting={walletConnecting} isWalletInstalled={isWalletInstalled()} availableWallets={getAvailableWallets()} onConnect={handleWalletConnect} onDisconnect={handleWalletDisconnect} onBack={() => setView('dashboard')} />}

        <footer className="mt-8 sm:mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs sm:text-sm">
            <span>🔒</span><span>Keys encrypted locally</span>
          </div>
          <p className="text-muted-foreground/50 text-[10px] sm:text-xs mt-1 sm:mt-2">SHADE v2.0 • Privacy First</p>
        </footer>
      </main>
    </div>
  );
}

// Network Selector Component with mainnet support
function NetworkSelector({ network, onNetworkChange }: { network: Network; onNetworkChange: (n: Network) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const colors: Record<Network, string> = {
    mainnet: 'from-red-500 to-rose-600',
    devnet: 'from-yellow-400 to-amber-500',
    testnet: 'from-blue-400 to-indigo-500',
  };
  const names: Record<Network, string> = {
    mainnet: 'Mainnet',
    devnet: 'Devnet',
    testnet: 'Testnet',
  };

  const handleNetworkChange = (net: Network) => {
    if (net === 'mainnet') {
      const confirmed = confirm('⚠️ MAINNET WARNING\n\nYou are switching to Mainnet.\nTransactions will use REAL SOL.\n\nAre you sure?');
      if (!confirmed) return;
    }
    onNetworkChange(net);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)} className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border ${network === 'mainnet' ? 'border-red-500/30' : 'border-white/10'} transition-all text-xs sm:text-sm`}>
        <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${colors[network]}`} />
        <span className="hidden sm:inline">{names[network]}</span>
        <span className="sm:hidden">{network[0].toUpperCase()}</span>
        {network === 'mainnet' && <span className="text-red-400 text-[10px]">⚠️</span>}
        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {(['mainnet', 'devnet', 'testnet'] as const).map(net => (
            <button key={net} onClick={() => handleNetworkChange(net)} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-white/5 transition-colors ${network === net ? 'text-primary' : 'text-foreground'} ${net === 'mainnet' ? 'border-b border-red-500/20' : ''}`}>
              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${colors[net]}`} />
              {names[net]}
              {net === 'mainnet' && <span className="ml-auto text-red-400 text-[10px]">Real $</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
