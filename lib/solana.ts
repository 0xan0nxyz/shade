// Solana configuration and connection management
// All modules should import getConnection() from here instead of creating their own

import { Connection, PublicKey } from '@solana/web3.js';
import { NETWORKS, Network, DEFAULT_NETWORK, STORAGE_KEY_NETWORK } from './constants';

// Re-export types and constants for convenience
export { NETWORKS, DEFAULT_NETWORK };
export type { Network };

// Singleton connection cache - recreated when network changes
let cachedConnection: Connection | null = null;
let cachedNetwork: Network | null = null;

/**
 * Get the current network from localStorage or return default
 */
export function getNetwork(): Network {
  if (typeof window === 'undefined') return DEFAULT_NETWORK;
  const saved = localStorage.getItem(STORAGE_KEY_NETWORK);
  if (saved && saved in NETWORKS) {
    return saved as Network;
  }
  return DEFAULT_NETWORK;
}

/**
 * Set the current network and clear connection cache
 */
export function setNetwork(network: Network): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_NETWORK, network);
    // Clear cached connection to force reconnection
    cachedConnection = null;
    cachedNetwork = null;
  }
}

/**
 * Get a Solana connection for the current network
 * Uses cached connection if network hasn't changed
 */
export function getConnection(): Connection {
  const currentNetwork = getNetwork();

  // Return cached connection if network matches
  if (cachedConnection && cachedNetwork === currentNetwork) {
    return cachedConnection;
  }

  // Create new connection
  const networkConfig = NETWORKS[currentNetwork];
  cachedConnection = new Connection(networkConfig.rpcUrl, {
    commitment: 'confirmed',
    disableRetryOnRateLimit: true,
  });
  cachedNetwork = currentNetwork;

  return cachedConnection;
}

/**
 * Check if current network is mainnet
 */
export function isMainnet(): boolean {
  return NETWORKS[getNetwork()].isMainnet;
}

/**
 * Get explorer URL for an address
 */
export function getExplorerUrl(address: string): string {
  const network = getNetwork();
  const baseUrl = NETWORKS[network].explorerUrl;
  const clusterParam = network === 'mainnet' ? '' : `?cluster=${network}`;
  return `${baseUrl}/address/${address}${clusterParam}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getTransactionUrl(signature: string): string {
  const network = getNetwork();
  const baseUrl = NETWORKS[network].explorerUrl;
  const clusterParam = network === 'mainnet' ? '' : `?cluster=${network}`;
  return `${baseUrl}/tx/${signature}${clusterParam}`;
}

// Common token mints (mainnet addresses)
export const TOKENS = {
  SOL: new PublicKey('So11111111111111111111111111111111111111111'),
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  USDT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
} as const;

/**
 * Request airdrop (devnet/testnet only)
 */
export async function requestAirdrop(publicKey: string, amount: number = 1): Promise<string | null> {
  const network = getNetwork();

  // Block airdrop on mainnet
  if (NETWORKS[network].isMainnet) {
    console.warn('Airdrop not available on mainnet');
    return null;
  }

  try {
    const connection = getConnection();
    const pubkey = new PublicKey(publicKey);
    const signature = await connection.requestAirdrop(pubkey, amount * 1e9);
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    return null;
  }
}
