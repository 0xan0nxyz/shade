// StorageProvider - Abstract interface for secure storage
// All implementations must encrypt data before persistence

export interface StorageRecord {
  key: string;
  value: string;
  encrypted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface StorageProvider {
  // Core operations
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;

  // Batch operations
  getMultiple(keys: string[]): Promise<Map<string, string | null>>;
  setMultiple(entries: Array<{ key: string; value: string }>): Promise<boolean>;
  deleteMultiple(keys: string[]): Promise<boolean>;

  // Key management
  keys(prefix?: string): Promise<string[]>;
  clear(prefix?: string): Promise<boolean>;

  // Lifecycle
  initialize(): Promise<boolean>;
  isReady(): boolean;
  close(): Promise<void>;
}

export interface SecureStorageOptions {
  dbName?: string;
  storeName?: string;
  version?: number;
}

export const DEFAULT_STORAGE_OPTIONS: SecureStorageOptions = {
  dbName: 'shade-wallet',
  storeName: 'secure-store',
  version: 1,
};
