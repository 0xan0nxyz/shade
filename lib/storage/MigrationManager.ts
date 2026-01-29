// MigrationManager - Handles migration from localStorage to IndexedDB
// Detects legacy data and re-encrypts with proper key derivation

import { IndexedDBStorage } from './IndexedDBStorage';
import { secureKeyManager } from './SecureKeyManager';

// Legacy storage key patterns
const LEGACY_KEYS = {
  BURNERS: 'shade_burners',
  BURNER_KEY_PREFIX: 'shade_key_',
  STEALTH_MASTER_SEED: 'shade_stealth_master_seed',
  STEALTH_INDEX: 'shade_stealth_index',
  STEALTH_ADDRESSES: 'shade_stealth_addresses',
  FEE_PAYER: 'shade_fee_payer_address',
  PREPAID_BURNERS: 'shade_prepaid_burners',
  PASSKEY_CREDENTIAL: 'shade_wallet_credential_id',
  PASSKEY_PUBLIC_KEY: 'shade_wallet_public_key',
  PASSKEY_DERIVATION_PATH: 'shade_wallet_derivation_path',
  NETWORK: 'shade_network',
};

// New storage key patterns (prefixed for organization)
export const STORAGE_KEYS = {
  // Meta
  MIGRATION_VERSION: 'meta:migration_version',
  MASTER_SALT: 'meta:master_salt',

  // Burners
  BURNER_LIST: 'burners:list',
  BURNER_KEY: (id: string) => `burners:key:${id}`,

  // Stealth
  STEALTH_SEED: 'stealth:master_seed',
  STEALTH_INDEX: 'stealth:index',
  STEALTH_ADDRESSES: 'stealth:addresses',

  // Gasless
  FEE_PAYER: 'gasless:fee_payer',
  PREPAID_BURNERS: 'gasless:prepaid',

  // Passkey
  PASSKEY_CREDENTIAL: 'passkey:credential_id',
  PASSKEY_PUBLIC_KEY: 'passkey:public_key',
  PASSKEY_PATH: 'passkey:derivation_path',

  // Settings
  NETWORK: 'settings:network',
};

export interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  errors: string[];
  needsPassword: boolean;
}

export class MigrationManager {
  private storage: IndexedDBStorage;

  constructor(storage: IndexedDBStorage) {
    this.storage = storage;
  }

  // Check if migration is needed
  hasLegacyData(): boolean {
    if (typeof localStorage === 'undefined') return false;

    // Check for any legacy keys
    return Object.values(LEGACY_KEYS).some((key) => {
      if (typeof key === 'string') {
        return localStorage.getItem(key) !== null;
      }
      return false;
    });
  }

  // Check for burner keys specifically
  getLegacyBurnerIds(): string[] {
    if (typeof localStorage === 'undefined') return [];

    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LEGACY_KEYS.BURNER_KEY_PREFIX)) {
        ids.push(key.replace(LEGACY_KEYS.BURNER_KEY_PREFIX, ''));
      }
    }
    return ids;
  }

  // Migrate all legacy data
  async migrate(password: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedKeys: [],
      errors: [],
      needsPassword: false,
    };

    if (!this.hasLegacyData()) {
      result.success = true;
      return result;
    }

    // Ensure key manager is unlocked
    if (!secureKeyManager.isActive()) {
      const unlocked = await secureKeyManager.unlock(password);
      if (!unlocked) {
        result.errors.push('Failed to unlock key manager');
        return result;
      }
    }

    try {
      // Migrate burner list
      await this.migrateBurnerList(result);

      // Migrate burner keys
      await this.migrateBurnerKeys(result);

      // Migrate stealth data
      await this.migrateStealthData(result);

      // Migrate gasless data
      await this.migrateGaslessData(result);

      // Migrate passkey data
      await this.migratePasskeyData(result);

      // Migrate settings
      await this.migrateSettings(result);

      // Store migration version and master salt
      await this.storage.set(STORAGE_KEYS.MIGRATION_VERSION, '1');
      await this.storage.set(
        STORAGE_KEYS.MASTER_SALT,
        secureKeyManager.getMasterSalt() || ''
      );

      // Clean up legacy data after successful migration
      if (result.errors.length === 0) {
        this.cleanupLegacyData();
        result.success = true;
      }
    } catch (error) {
      result.errors.push(`Migration failed: ${error}`);
    }

    return result;
  }

  private async migrateBurnerList(result: MigrationResult): Promise<void> {
    const legacyData = localStorage.getItem(LEGACY_KEYS.BURNERS);
    if (!legacyData) return;

    try {
      // Legacy data is plain JSON
      const burners = JSON.parse(legacyData);
      await this.storage.set(STORAGE_KEYS.BURNER_LIST, JSON.stringify(burners));
      result.migratedKeys.push('burner_list');
    } catch (error) {
      result.errors.push(`Failed to migrate burner list: ${error}`);
    }
  }

  private async migrateBurnerKeys(result: MigrationResult): Promise<void> {
    const burnerIds = this.getLegacyBurnerIds();

    for (const id of burnerIds) {
      const legacyKey = LEGACY_KEYS.BURNER_KEY_PREFIX + id;
      const legacyData = localStorage.getItem(legacyKey);

      if (!legacyData) continue;

      try {
        // Legacy keys were encrypted with wallet ID as password
        // We need to decrypt with old method and re-encrypt with new
        // For now, store as-is and mark for re-encryption on first use
        await this.storage.set(
          STORAGE_KEYS.BURNER_KEY(id),
          JSON.stringify({
            legacy: true,
            data: legacyData,
            needsReencryption: true,
          })
        );
        result.migratedKeys.push(`burner_key_${id}`);
      } catch (error) {
        result.errors.push(`Failed to migrate burner key ${id}: ${error}`);
      }
    }
  }

  private async migrateStealthData(result: MigrationResult): Promise<void> {
    // Migrate stealth master seed
    const seed = localStorage.getItem(LEGACY_KEYS.STEALTH_MASTER_SEED);
    if (seed) {
      try {
        await this.storage.set(
          STORAGE_KEYS.STEALTH_SEED,
          JSON.stringify({ legacy: true, data: seed, needsReencryption: true })
        );
        result.migratedKeys.push('stealth_seed');
      } catch (error) {
        result.errors.push(`Failed to migrate stealth seed: ${error}`);
      }
    }

    // Migrate stealth index
    const index = localStorage.getItem(LEGACY_KEYS.STEALTH_INDEX);
    if (index) {
      try {
        await this.storage.set(STORAGE_KEYS.STEALTH_INDEX, index);
        result.migratedKeys.push('stealth_index');
      } catch (error) {
        result.errors.push(`Failed to migrate stealth index: ${error}`);
      }
    }

    // Migrate stealth addresses
    const addresses = localStorage.getItem(LEGACY_KEYS.STEALTH_ADDRESSES);
    if (addresses) {
      try {
        await this.storage.set(STORAGE_KEYS.STEALTH_ADDRESSES, addresses);
        result.migratedKeys.push('stealth_addresses');
      } catch (error) {
        result.errors.push(`Failed to migrate stealth addresses: ${error}`);
      }
    }
  }

  private async migrateGaslessData(result: MigrationResult): Promise<void> {
    // Migrate fee payer
    const feePayer = localStorage.getItem(LEGACY_KEYS.FEE_PAYER);
    if (feePayer) {
      try {
        await this.storage.set(STORAGE_KEYS.FEE_PAYER, feePayer);
        result.migratedKeys.push('fee_payer');
      } catch (error) {
        result.errors.push(`Failed to migrate fee payer: ${error}`);
      }
    }

    // Migrate prepaid burners (these had hardcoded key - mark for re-encryption)
    const prepaid = localStorage.getItem(LEGACY_KEYS.PREPAID_BURNERS);
    if (prepaid) {
      try {
        await this.storage.set(
          STORAGE_KEYS.PREPAID_BURNERS,
          JSON.stringify({ legacy: true, data: prepaid, needsReencryption: true })
        );
        result.migratedKeys.push('prepaid_burners');
      } catch (error) {
        result.errors.push(`Failed to migrate prepaid burners: ${error}`);
      }
    }
  }

  private async migratePasskeyData(result: MigrationResult): Promise<void> {
    const credential = localStorage.getItem(LEGACY_KEYS.PASSKEY_CREDENTIAL);
    if (credential) {
      try {
        await this.storage.set(STORAGE_KEYS.PASSKEY_CREDENTIAL, credential);
        result.migratedKeys.push('passkey_credential');
      } catch (error) {
        result.errors.push(`Failed to migrate passkey credential: ${error}`);
      }
    }

    const publicKey = localStorage.getItem(LEGACY_KEYS.PASSKEY_PUBLIC_KEY);
    if (publicKey) {
      try {
        await this.storage.set(STORAGE_KEYS.PASSKEY_PUBLIC_KEY, publicKey);
        result.migratedKeys.push('passkey_public_key');
      } catch (error) {
        result.errors.push(`Failed to migrate passkey public key: ${error}`);
      }
    }

    const path = localStorage.getItem(LEGACY_KEYS.PASSKEY_DERIVATION_PATH);
    if (path) {
      try {
        await this.storage.set(STORAGE_KEYS.PASSKEY_PATH, path);
        result.migratedKeys.push('passkey_path');
      } catch (error) {
        result.errors.push(`Failed to migrate passkey path: ${error}`);
      }
    }
  }

  private async migrateSettings(result: MigrationResult): Promise<void> {
    const network = localStorage.getItem(LEGACY_KEYS.NETWORK);
    if (network) {
      try {
        await this.storage.set(STORAGE_KEYS.NETWORK, network);
        result.migratedKeys.push('network');
      } catch (error) {
        result.errors.push(`Failed to migrate network setting: ${error}`);
      }
    }
  }

  private cleanupLegacyData(): void {
    // Remove all legacy keys
    Object.values(LEGACY_KEYS).forEach((key) => {
      if (typeof key === 'string') {
        localStorage.removeItem(key);
      }
    });

    // Remove burner keys
    const burnerIds = this.getLegacyBurnerIds();
    burnerIds.forEach((id) => {
      localStorage.removeItem(LEGACY_KEYS.BURNER_KEY_PREFIX + id);
    });

    // Remove vault keys from military-grade
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('vault_')) {
        localStorage.removeItem(key);
      }
    }
  }

  // Check if IndexedDB already has migrated data
  async hasMigratedData(): Promise<boolean> {
    try {
      const version = await this.storage.get(STORAGE_KEYS.MIGRATION_VERSION);
      return version !== null;
    } catch {
      return false;
    }
  }

  // Get stored master salt (for returning users)
  async getStoredMasterSalt(): Promise<string | null> {
    try {
      return await this.storage.get(STORAGE_KEYS.MASTER_SALT);
    } catch {
      return null;
    }
  }
}
