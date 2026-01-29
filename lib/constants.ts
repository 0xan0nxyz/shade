// Centralized constants for SHADE Wallet
// Network RPC Configuration

export const NETWORKS = {
  mainnet: {
    name: 'Mainnet Beta',
    rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    faucetUrl: null, // No faucet on mainnet
    isMainnet: true,
  },
  devnet: {
    name: 'Devnet',
    rpcUrl: process.env.NEXT_PUBLIC_DEVNET_RPC || 'https://api.devnet.solana.com',
    explorerUrl: 'https://solscan.io?cluster=devnet',
    faucetUrl: 'https://faucet.solana.com',
    isMainnet: false,
  },
  testnet: {
    name: 'Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_TESTNET_RPC || 'https://api.testnet.solana.com',
    explorerUrl: 'https://solscan.io?cluster=testnet',
    faucetUrl: 'https://faucet.solana.com',
    isMainnet: false,
  },
} as const;

export type Network = keyof typeof NETWORKS;

// Default network for initial load
export const DEFAULT_NETWORK: Network = 'devnet';

// App metadata
export const APP_VERSION = '2.0.0';
export const APP_NAME = 'SHADE Wallet';

// Storage keys
export const STORAGE_KEY_NETWORK = 'shade_network';

// Request timeouts (ms)
export const REQUEST_TIMEOUTS = {
  DEFAULT: 30000,
  RPC: 15000,
  TRANSACTION: 60000,
} as const;

// Error messages for consistent UX
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Check your connection and try again.',
  WALLET_NOT_FOUND: 'Wallet not found. Please set up your wallet first.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  TRANSACTION_TIMEOUT: 'Transaction timed out. Check your wallet for status.',
  INVALID_ADDRESS: 'Invalid wallet address.',
  MAINNET_CONFIRMATION_REQUIRED: 'Please confirm this mainnet transaction.',
} as const;

// Transaction confirmation levels
export const CONFIRMATION_LEVELS = {
  PROCESSED: 'processed',
  CONFIRMED: 'confirmed',
  FINALIZED: 'finalized',
} as const;
