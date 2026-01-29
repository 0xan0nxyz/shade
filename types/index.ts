// Type definitions for SHADE

export interface BurnerWallet {
  id: string;
  label: string;
  publicKey: string;
  createdAt: number;
}

export interface BurnerWithBalance extends BurnerWallet {
  balance: number;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface WalletState {
  burners: BurnerWithBalance[];
  activeBurner: string | null;
  network: string;
  isConnecting: boolean;
}
