'use client';

import { useState, useEffect, useRef } from 'react';
import { useBurners, useNetwork, useMainnetConfirm } from '@/hooks';
import {
  StatsCards,
  ActionButtons,
  BurnerCard,
  EmptyState,
} from '@/components/dashboard';
import {
  CreateView,
  BackupView,
  TransferView,
  StealthView,
  PasskeyView,
  GaslessView,
  ConnectWalletView,
} from '@/components/views';
import { MainnetConfirmDialog, PasswordSetup } from '@/components/shared';
import { initializeStorage, unlockStorage, isStorageReady } from '@/lib/storage';
import { exportBurners, downloadBackup, importBurners, destroyBurner } from '@/lib/burner';
import { exportCompleteWallet, importCompleteWallet, getBackupSummary, downloadBackup as downloadCompleteBackup } from '@/lib/backup';
import { generateStealthAddress, getStealthAddresses, sweepStealthAddress, getStealthMetaAddress, isStealthInitialized } from '@/lib/stealth';
import { createPasskeyWallet, authenticateWithPasskey, hasPasskeyWallet, deletePasskeyWallet, isPasskeyAvailable } from '@/lib/passkey';
import { setFeePayerAddress, getFeePayerAddress, createPrepaidBurner, getPrepaidBurners, deletePrepaidBurner, getGaslessStats, clearGaslessConfig } from '@/lib/gasless';
import { connectWallet, disconnectWallet, getWalletBalance, isWalletInstalled, getAvailableWallets, getConnectedWallet, ConnectedWallet } from '@/lib/wallet-connection';
import { Network } from '@/lib/constants';
import { Ghost, ChevronDown, Droplets, Wallet, AlertTriangle, Info, Book, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  }, [network]);

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

    refreshBalance();
    const interval = setInterval(refreshBalance, 10000);
    return () => clearInterval(interval);
  }, [connectedWallet?.address]);

  // Handlers
  const handleCreateBurner = async () => {
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

    // Require storage to be unlocked for decryption
    if (!storageUnlocked) {
      setShowPasswordSetup(true);
      return;
    }

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
    } catch (error) {
      console.error('Sweep failed:', error);
      alert(`Sweep failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const networkConfig = {
    mainnet: { color: 'bg-red-500', label: 'MAINNET', warning: true },
    devnet: { color: 'bg-yellow-400', label: 'DEVNET', warning: false },
    testnet: { color: 'bg-blue-400', label: 'TESTNET', warning: false },
  };

  const currentNetwork = networkConfig[network];

  return (
    <div className="min-h-screen">
      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <PasswordSetup
          onUnlocked={handlePasswordUnlocked}
          onCancel={() => setShowPasswordSetup(false)}
        />
      )}

      {/* Mainnet Confirmation Dialog */}
      <MainnetConfirmDialog {...dialogState} />

      {/* Navbar */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            {/* Logo + X Link */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-3xl sm:text-4xl">🌒</span>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                    SHADE
                  </h1>
                  <p className="text-xs sm:text-sm text-primary font-semibold uppercase tracking-wide">
                    Privacy Wallet
                  </p>
                </div>
              </div>
              <a
                href="https://x.com/0x_anonnn"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/anon.jpg"
                  alt="@0x_anonnn"
                  className="w-7 h-7 rounded-full ring-1 ring-white/10"
                />
                <span className="text-sm text-muted-foreground font-medium">@0x_anonnn</span>
              </a>
              <Link
                href="/about"
                className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Info className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">About</span>
              </Link>
              <Link
                href="/docs"
                className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Book className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">Docs</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="https://github.com/0x-anon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="GitHub"
                >
                  <svg className="w-5 h-5 text-muted-foreground hover:text-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/0x_anonnn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="X (Twitter)"
                >
                  <svg className="w-5 h-5 text-muted-foreground hover:text-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Network Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm border-white/10 hover:border-white/20 h-9 sm:h-10 px-2.5 sm:px-4">
                    <div className={`w-2 h-2 rounded-full ${currentNetwork.color}`} />
                    <span>{currentNetwork.label}</span>
                    {currentNetwork.warning && (
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" strokeWidth={1.5} />
                    )}
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass min-w-[140px]">
                  {(['mainnet', 'devnet', 'testnet'] as const).map((net) => {
                    const config = networkConfig[net];
                    return (
                      <DropdownMenuItem
                        key={net}
                        onClick={() => {
                          if (net === 'mainnet') {
                            const confirmed = confirm('⚠️ MAINNET WARNING\n\nYou are switching to Mainnet.\nTransactions will use REAL SOL.\n\nAre you sure?');
                            if (!confirmed) return;
                          }
                          setNetwork(net);
                        }}
                        className="text-sm gap-2"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
                        {config.label}
                        {config.warning && <span className="ml-auto text-red-400 text-[10px]">⚠️</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Faucet */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequestAirdrop(burners[0]?.publicKey || '')}
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm border-blue-500/20 hover:border-blue-500/40 text-blue-400 h-9 sm:h-10 px-2.5 sm:px-4"
              >
                <Droplets className="w-4 h-4 sm:w-4 sm:h-4" strokeWidth={1.5} />
                <span>Faucet</span>
              </Button>

              {/* Wallet Connect */}
              {connectedWallet ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('connect')}
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm border-purple-500/30 hover:border-purple-500/50 text-purple-400 h-9 sm:h-10 px-2.5 sm:px-4"
                >
                  <Wallet className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-mono text-[11px] sm:text-xs">
                    {connectedWallet.address.slice(0, 4)}...{connectedWallet.address.slice(-4)}
                  </span>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-[10px] sm:text-xs px-1.5 sm:px-2 h-auto font-medium">
                    {walletBalance.toFixed(2)}
                  </Badge>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isWalletInstalled() ? handleWalletConnect() : alert('Please install Phantom wallet')}
                  disabled={walletConnecting}
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm border-purple-500/20 hover:border-purple-500/40 text-purple-400 h-9 sm:h-10 px-2.5 sm:px-4"
                >
                  <Wallet className="w-4 h-4" strokeWidth={1.5} />
                  <span>{walletConnecting ? '...' : 'Connect'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Airdrop Status */}
        {airdropStatus && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl glass border border-primary/20 text-center animate-fade-in">
            <p className="text-xs sm:text-sm text-primary font-medium">{airdropStatus}</p>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium">
            <Ghost className="w-4 h-4" strokeWidth={1.5} />
            Privacy-First Wallet for Solana
          </div>
          <h2 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
            <span className="text-gradient">Burn Smart.</span>
            <span className="block text-xl xs:text-2xl sm:text-3xl md:text-4xl text-foreground/90 mt-3 sm:mt-4 font-medium">
              Stay Anonymous.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Create disposable wallets, generate stealth addresses, and transact without leaving a trace.
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            Military-grade encryption. Zero server trust.
          </p>
          <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link href="/docs/getting-started">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6">
                <Book className="w-4 h-4" strokeWidth={1.5} />
                Get Started
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="gap-2 border-white/10 hover:border-white/20 h-11 px-6">
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                Documentation
              </Button>
            </Link>
          </div>
        </div>

        <StatsCards burnerCount={burners.length} totalBalance={totalBalance} network={network} />
        <ActionButtons onViewChange={setView} onAirdropRequest={() => handleRequestAirdrop(burners[0]?.publicKey || '')} />

        {/* Views */}
        {view === 'dashboard' && (
          burners.length === 0 ? <EmptyState onCreateClick={() => setView('create')} /> : (
            <div className="space-y-3 max-w-3xl mx-auto">
              {burners.map((burner) => (
                <BurnerCard
                  key={burner.id}
                  burner={burner}
                  isExpanded={expandedId === burner.id}
                  isMobile={isMobile}
                  onToggleExpand={(open) => setExpandedId(open ? burner.id : null)}
                  onCopy={() => navigator.clipboard.writeText(burner.publicKey)}
                  onSweep={() => { setSelectedBurnerId(burner.id); setView('transfer'); }}
                  onDestroy={() => handleDestroy(burner.id)}
                />
              ))}
            </div>
          )
        )}

        {view === 'create' && <CreateView loading={loading} onBack={() => setView('dashboard')} onCreate={handleCreateBurner} />}
        {view === 'backup' && (
          <BackupView
            backupPassword={backupPassword}
            importJson={importJson}
            backupStatus={backupStatus}
            burnerCount={burners.length}
            onPasswordChange={setBackupPassword}
            onImportJsonChange={setImportJson}
            onExport={handleExportBackup}
            onExportComplete={handleExportCompleteBackup}
            onImport={handleImportBackup}
            onBack={() => { setView('dashboard'); setBackupStatus(null); }}
            backupSummary={backupSummary}
          />
        )}
        {view === 'transfer' && (
          <TransferView
            recipientAddress={recipientAddress}
            selectedBurnerLabel={selectedBurner?.label}
            selectedBurnerBalance={selectedBurner?.balance || 0}
            transferStatus={transferStatus}
            transferLoading={transferLoading}
            onRecipientChange={setRecipientAddress}
            onSweep={handleSweep}
            onBack={() => { setView('dashboard'); setTransferStatus('idle'); }}
          />
        )}
        {view === 'stealth' && (
          <StealthView
            stealthPassword={stealthPassword}
            stealthInitialized={stealthInitialized}
            stealthAddresses={stealthAddresses}
            metaAddress={metaAddress}
            onPasswordChange={setStealthPassword}
            onInitialize={handleStealthInit}
            onGenerate={handleStealthGenerate}
            onSweep={handleStealthSweep}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'passkey' && (
          <PasskeyView
            passkeyAvailable={passkeyAvailable}
            hasWallet={hasWallet}
            passkeyLoading={passkeyLoading}
            username={username}
            onUsernameChange={setUsername}
            onCreateWallet={handlePasskeyCreate}
            onAuthenticate={handlePasskeyAuth}
            onDeleteWallet={handlePasskeyDelete}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'gasless' && (
          <GaslessView
            feePayerAddress={feePayerAddress}
            gaslessStats={gaslessStats}
            gaslessLoading={gaslessLoading}
            prepaidBurners={getPrepaidBurners()}
            onFeePayerChange={(addr) => { setFeePayerAddressState(addr); setFeePayerAddress(addr); }}
            onCreatePrepaid={handleGaslessCreate}
            onDeletePrepaid={(id) => { deletePrepaidBurner(id); getGaslessStats().then(setGaslessStats); }}
            onClearConfig={handleGaslessClear}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'connect' && (
          <ConnectWalletView
            connectedWallet={connectedWallet}
            walletBalance={walletBalance}
            walletConnecting={walletConnecting}
            isWalletInstalled={isWalletInstalled()}
            availableWallets={getAvailableWallets()}
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
            onBack={() => setView('dashboard')}
          />
        )}

        {/* Footer */}
        <footer className="mt-12 sm:mt-20 pt-8 border-t border-white/5">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Beta Warning */}
            <div className="text-center p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <p className="text-xs sm:text-sm text-yellow-500/80">
                <span className="font-semibold">⚠️ Beta Software:</span> SHADE is currently in testing. Use at your own risk. Not responsible for any loss of funds.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/10">|</span>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <span className="text-white/10">|</span>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
            </div>

            {/* Bottom */}
            <div className="text-center space-y-2 pb-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <span className="text-primary">◈</span>
                <span className="font-medium">Keys encrypted locally • Open source</span>
              </div>
              <p className="text-muted-foreground/60 text-xs">
                © 2026 SHADE. All rights reserved. v1.0-beta
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
