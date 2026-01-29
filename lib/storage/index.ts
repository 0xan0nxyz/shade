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
import { MigrationManager, STORAGE_KEYS, type MigrationResult } from './MigrationManager';
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

// Try to recover salt from existing encrypted records in IndexedDB
async function recoverSaltFromIndexedDB(): Promise<string | null> {
  if (!storageInstance) return null;

  try {
    // Try to get any raw record that might contain the salt
    const keysToTry = [
      STORAGE_KEYS.BURNER_LIST,
      'meta:master_salt',
      STORAGE_KEYS.STEALTH_SEED,
    ];

    for (const key of keysToTry) {
      const raw = await storageInstance.getRaw(key);
      if (raw?.data?.salt) {
        console.log('Recovered salt from:', key);
        return raw.data.salt;
      }
    }
  } catch (error) {
    console.error('Salt recovery failed:', error);
  }

  return null;
}

// Unlock storage with password
export async function unlockStorage(password: string): Promise<boolean> {
  if (!storageInstance) {
    const init = await initializeStorage();
    if (!init.success) return false;
  }

  // Check for existing salt from localStorage first (unencrypted)
  // This is critical - salt must be readable BEFORE decryption
  let salt: string | undefined;

  if (typeof localStorage !== 'undefined') {
    salt = localStorage.getItem('shade_master_salt') || undefined;
  }

  // Fallback to migration manager (for backwards compatibility)
  if (!salt && migrationManager) {
    salt = (await migrationManager.getStoredMasterSalt()) || undefined;
  }

  // Last resort: try to recover salt from any encrypted record in IndexedDB
  if (!salt) {
    salt = (await recoverSaltFromIndexedDB()) || undefined;
    if (salt) {
      console.log('Recovered master salt from IndexedDB records');
      // Save it to localStorage for future use
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('shade_master_salt', salt);
      }
    }
  }

  // Debug: log salt status
  console.log('🔐 Unlock attempt:', {
    saltSource: salt ? (localStorage.getItem('shade_master_salt') ? 'localStorage' : 'recovered') : 'new',
    saltPreview: salt ? salt.substring(0, 20) + '...' : 'none',
  });

  const unlocked = await secureKeyManager.unlock(password, salt);
  if (!unlocked) {
    console.error('🔐 SecureKeyManager unlock failed');
    return false;
  }

  console.log('🔐 Storage unlocked successfully');

  // Save salt to localStorage if this is first unlock
  if (!salt && typeof localStorage !== 'undefined') {
    const newSalt = secureKeyManager.getMasterSalt();
    if (newSalt) {
      localStorage.setItem('shade_master_salt', newSalt);
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
