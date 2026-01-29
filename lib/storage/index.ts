// Storage Module - Secure storage for SHADE Wallet
// Provides encrypted IndexedDB storage with proper key derivation

export type { StorageProvider, StorageRecord, SecureStorageOptions } from './StorageProvider';
export { DEFAULT_STORAGE_OPTIONS } from './StorageProvider';
export type { EncryptedData } from './SecureKeyManager';
export { SecureKeyManager, secureKeyManager } from './SecureKeyManager';
export { IndexedDBStorage } from './IndexedDBStorage';
export type { MigrationResult } from './MigrationManager';
export { MigrationManager, STORAGE_KEYS } from './MigrationManager';

import { IndexedDBStorage } from './IndexedDBStorage';
import { MigrationManager, STORAGE_KEYS } from './MigrationManager';
import { secureKeyManager } from './SecureKeyManager';

// Singleton storage instance
let storageInstance: IndexedDBStorage | null = null;
let migrationManager: MigrationManager | null = null;

export interface StorageInitResult {
  success: boolean;
  needsMigration: boolean;
  needsPassword: boolean;
  error?: string;
}

// Initialize storage system
export async function initializeStorage(): Promise<StorageInitResult> {
  if (storageInstance && storageInstance.isReady()) {
    return { success: true, needsMigration: false, needsPassword: false };
  }

  storageInstance = new IndexedDBStorage();
  const initialized = await storageInstance.initialize();

  if (!initialized) {
    return {
      success: false,
      needsMigration: false,
      needsPassword: false,
      error: 'Failed to initialize IndexedDB',
    };
  }

  migrationManager = new MigrationManager(storageInstance);

  // Check if we have existing migrated data
  const hasMigrated = await migrationManager.hasMigratedData();
  const hasLegacy = migrationManager.hasLegacyData();

  return {
    success: true,
    needsMigration: hasLegacy && !hasMigrated,
    needsPassword: hasMigrated || hasLegacy,
  };
}

// Unlock storage with password
export async function unlockStorage(password: string): Promise<boolean> {
  if (!storageInstance) {
    const init = await initializeStorage();
    if (!init.success) return false;
  }

  // Check for existing salt
  let salt: string | undefined;
  if (migrationManager) {
    salt = (await migrationManager.getStoredMasterSalt()) || undefined;
  }

  const unlocked = await secureKeyManager.unlock(password, salt);
  if (!unlocked) return false;

  // Save salt if new
  if (!salt && storageInstance) {
    const newSalt = secureKeyManager.getMasterSalt();
    if (newSalt) {
      // We need to temporarily bypass the isReady check for this initial save
      // by setting the value directly after unlock
      try {
        await storageInstance.set(STORAGE_KEYS.MASTER_SALT, newSalt);
      } catch {
        // Ignore - will be saved during migration or normal use
      }
    }
  }

  return true;
}

// Run migration if needed
export async function runMigration(password: string): Promise<MigrationResult | null> {
  if (!migrationManager) return null;
  return migrationManager.migrate(password);
}

// Check if migration is needed
export function needsMigration(): boolean {
  return migrationManager?.hasLegacyData() ?? false;
}

// Get the storage instance
export function getStorage(): IndexedDBStorage | null {
  return storageInstance;
}

// Lock storage (clear keys from memory)
export function lockStorage(): void {
  secureKeyManager.lock();
}

// Check if storage is ready for use
export function isStorageReady(): boolean {
  return (
    storageInstance !== null &&
    storageInstance.isReady() &&
    secureKeyManager.isActive()
  );
}

// Convenience methods that use the singleton
export async function storageGet(key: string): Promise<string | null> {
  if (!storageInstance || !isStorageReady()) return null;
  return storageInstance.get(key);
}

export async function storageSet(key: string, value: string): Promise<boolean> {
  if (!storageInstance || !isStorageReady()) return false;
  return storageInstance.set(key, value);
}

export async function storageDelete(key: string): Promise<boolean> {
  if (!storageInstance || !isStorageReady()) return false;
  return storageInstance.delete(key);
}

export async function storageKeys(prefix?: string): Promise<string[]> {
  if (!storageInstance || !isStorageReady()) return [];
  return storageInstance.keys(prefix);
}

export async function storageClear(prefix?: string): Promise<boolean> {
  if (!storageInstance || !isStorageReady()) return false;
  return storageInstance.clear(prefix);
}
