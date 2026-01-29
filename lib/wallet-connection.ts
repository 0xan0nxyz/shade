// Wallet Connection - Phantom/Solflare support
// Uses Solana Wallet Adapter for browser extension connections

import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getConnection } from './solana';

// Phantom/Solflare injected providers
declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
    solflare?: SolflareProvider;
  }
}

interface PhantomProvider {
  isPhantom: boolean;
  publicKey?: { toBase58: () => string };
  isConnected?: boolean;
  connect: (options?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (transaction: any) => Promise<any>;
  on: (event: string, callback: (args: any) => void) => void;
  off?: (event: string, callback: (args: any) => void) => void;
  removeListener?: (event: string, callback: (args: any) => void) => void;
}

interface SolflareProvider {
  isSolflare: boolean;
  publicKey?: { toBase58: () => string };
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: { toBase58: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction: (transaction: any) => Promise<any>;
  on?: (event: string, callback: (args: any) => void) => void;
  off?: (event: string, callback: (args: any) => void) => void;
  removeListener?: (event: string, callback: (args: any) => void) => void;
}

export interface ConnectedWallet {
  address: string;
  adapter: 'phantom' | 'solflare' | 'unknown';
  connected: boolean;
}

export type WalletAdapter = 'phantom' | 'solflare';

// Common provider interface
type SolanaProvider = PhantomProvider | SolflareProvider;

// Store the provider reference for event handling
let solanaProvider: SolanaProvider | null = null;

/**
 * Get the Solana provider (Phantom or Solflare)
 */
function getProvider(): SolanaProvider | null {
  if (typeof window === 'undefined') return null;

  if (window.phantom?.solana?.isPhantom) {
    return window.phantom.solana;
  }

  if (window.solflare?.isSolflare) {
    return window.solflare;
  }

  return null;
}

/**
 * Check if Phantom is installed
 */
export function isPhantomInstalled(): boolean {
  return typeof window !== 'undefined' &&
         window.phantom?.solana?.isPhantom === true;
}

/**
 * Check if Solflare is installed
 */
export function isSolflareInstalled(): boolean {
  return typeof window !== 'undefined' &&
         window.solflare?.isSolflare === true;
}

/**
 * Check if any wallet is installed
 */
export function isWalletInstalled(): boolean {
  return isPhantomInstalled() || isSolflareInstalled();
}

/**
 * Get available wallet adapters
 */
export function getAvailableWallets(): WalletAdapter[] {
  const wallets: WalletAdapter[] = [];
  if (isPhantomInstalled()) wallets.push('phantom');
  if (isSolflareInstalled()) wallets.push('solflare');
  return wallets;
}

/**
 * Check if wallet is already connected
 */
export async function getConnectedWallet(): Promise<ConnectedWallet | null> {
  const provider = getProvider();
  if (!provider) return null;

  try {
    // Check isConnected flag and publicKey
    if (provider.isConnected && provider.publicKey) {
      const address = provider.publicKey.toBase58();
      return {
        address,
        adapter: window.phantom?.solana === provider ? 'phantom' : 'solflare',
        connected: true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Connect to Phantom
 */
export async function connectPhantom(): Promise<ConnectedWallet | null> {
  const provider = getProvider();
  if (!provider || !window.phantom?.solana?.isPhantom) {
    throw new Error('Phantom not installed');
  }

  try {
    // This will prompt the user if not already connected
    const response = await provider.connect();
    const address = response.publicKey.toBase58();

    solanaProvider = provider;

    return {
      address,
      adapter: 'phantom',
      connected: true,
    };
  } catch (error) {
    console.error('Phantom connection failed:', error);
    return null;
  }
}

/**
 * Connect to Solflare
 */
export async function connectSolflare(): Promise<ConnectedWallet | null> {
  if (!isSolflareInstalled()) {
    throw new Error('Solflare not installed');
  }

  try {
    const response = await window.solflare!.connect();
    const address = response.publicKey.toBase58();
    
    return {
      address,
      adapter: 'solflare',
      connected: true,
    };
  } catch (error) {
    console.error('Solflare connection failed:', error);
    return null;
  }
}

/**
 * Connect to any available wallet
 */
export async function connectWallet(): Promise<ConnectedWallet | null> {
  // Try Phantom first, then Solflare
  if (isPhantomInstalled()) {
    return connectPhantom();
  }
  if (isSolflareInstalled()) {
    return connectSolflare();
  }
  return null;
}

/**
 * Listen for account changes
 */
export function onAccountChange(callback: (publicKey: string | null) => void): () => void {
  const provider = getProvider();
  if (!provider) return () => {};

  const handler = (publicKey: any) => {
    if (publicKey) {
      callback(publicKey.toBase58 ? publicKey.toBase58() : publicKey);
    } else {
      callback(null);
    }
  };

  provider.on('accountChanged', handler);

  return () => {
    // Cleanup listener
    try {
      if (provider.removeListener) {
        provider.removeListener('accountChanged', handler);
      }
    } catch {}
  };
}

/**
 * Listen for connection/disconnection events
 */
export function onConnectChange(callback: (connected: boolean, publicKey?: string) => void): () => void {
  const provider = getProvider();
  if (!provider) return () => {};

  const connectHandler = () => {
    callback(true, provider.publicKey?.toBase58());
  };

  const disconnectHandler = () => {
    callback(false);
  };

  provider.on('connect', connectHandler);
  provider.on('disconnect', disconnectHandler);

  return () => {
    try {
      if (provider.removeListener) {
        provider.removeListener('connect', connectHandler);
        provider.removeListener('disconnect', disconnectHandler);
      }
    } catch {}
  };
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(adapter: WalletAdapter): Promise<void> {
  const provider = getProvider();
  if (!provider) return;

  try {
    await provider.disconnect();
    solanaProvider = null;
  } catch (error) {
    console.error('Disconnect failed:', error);
  }
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(address: string): Promise<number> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(address);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

/**
 * Sign message with wallet
 */
export async function signMessage(
  message: string,
  adapter: WalletAdapter
): Promise<Uint8Array | null> {
  try {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    
    if (adapter === 'phantom' && window.phantom?.solana) {
      const response = await window.phantom.solana.signMessage(encodedMessage);
      return response.signature;
    } else if (adapter === 'solflare' && window.solflare) {
      const response = await window.solflare.signMessage(encodedMessage);
      return response.signature;
    }
    return null;
  } catch (error) {
    console.error('Sign message failed:', error);
    return null;
  }
}

/**
 * Listen for wallet connection changes
 */
export function onWalletChange(
  callback: (connected: boolean, address?: string) => void
): () => void {
  if (typeof window === 'undefined' || !window.phantom?.solana) {
    return () => {};
  }

  const handleConnect = (args: any) => {
    callback(true, args.publicKey?.toBase58());
  };

  const handleDisconnect = () => {
    callback(false);
  };

  window.phantom.solana.on('connect', handleConnect);
  window.phantom.solana.on('disconnect', handleDisconnect);

  return () => {
    window.phantom?.solana?.off?.('connect', handleConnect);
    window.phantom?.solana?.off?.('disconnect', handleDisconnect);
  };
}

/**
 * Get wallet icon
 */
export function getWalletIcon(adapter: WalletAdapter): string {
  if (adapter === 'phantom') {
    return '👻';
  } else if (adapter === 'solflare') {
    return '☀️';
  }
  return '💼';
}

/**
 * Get wallet name
 */
export function getWalletName(adapter: WalletAdapter): string {
  if (adapter === 'phantom') {
    return 'Phantom';
  } else if (adapter === 'solflare') {
    return 'Solflare';
  }
  return 'Wallet';
}
