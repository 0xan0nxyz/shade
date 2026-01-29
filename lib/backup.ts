// Complete Wallet Backup/Restore
// Exports all wallet data: burners, stealth addresses, gasless config
// Backward-compatible with v2 burner-only backups

import { getStoredBurners, getEncryptedPrivateKey, BurnerWallet } from './burner';
import { getStealthAddressesAsync, StealthAddress } from './stealth';
import { getPrepaidBurnersAsync, getFeePayerAddress, PrepaidBurner, setFeePayerAddress } from './gasless';
import {
  storageGet,
  storageSet,
  isStorageReady,
  STORAGE_KEYS,
} from './storage';
import { getNetwork } from './solana';

// Backup version history:
// v1: Legacy burner-only (deprecated)
// v2: Burner with AES-GCM encryption
// v3: Complete backup (burners + stealth + gasless)
const BACKUP_VERSION = 3;

// Complete backup format
export interface CompleteBackup {
  version: number;
  timestamp: number;
  network: string;
  appVersion: string;

  // Burner wallets
  burners: {
    id: string;
    label: string;
    publicKey: string;
    encryptedPrivateKey: string;
    createdAt: number;
  }[];

  // Stealth addresses (optional)
  stealth?: {
    encryptedMasterSeed: string | null;
    index: number;
    addresses: StealthAddress[];
  };

  // Gasless configuration (optional)
  gasless?: {
    feePayerAddress: string | null;
    prepaidBurners: PrepaidBurner[];
  };
}

// Legacy v2 backup format (burners only)
export interface LegacyBackupV2 {
  version: 2;
  timestamp: number;
  burners: {
    id: string;
    label: string;
    publicKey: string;
    encryptedPrivateKey: string;
    createdAt: number;
  }[];
}

// Export result
export interface ExportResult {
  success: boolean;
  backup: CompleteBackup | null;
  includedSections: {
    burners: number;
    stealthAddresses: number;
    gaslessBurners: number;
  };
}

// Import result
export interface ImportResult {
  success: boolean;
  imported: {
    burners: number;
    stealthAddresses: number;
    gaslessBurners: number;
  };
  errors: string[];
}

/**
 * Export all wallet data to a complete backup
 */
export async function exportCompleteWallet(): Promise<ExportResult> {
  const result: ExportResult = {
    success: false,
    backup: null,
    includedSections: {
      burners: 0,
      stealthAddresses: 0,
      gaslessBurners: 0,
    },
  };

  try {
    const backup: CompleteBackup = {
      version: BACKUP_VERSION,
      timestamp: Date.now(),
      network: getNetwork(),
      appVersion: '2.0',
      burners: [],
    };

    // Export burners
    const burners = await getStoredBurners();
    for (const burner of burners) {
      const encryptedKey = await getEncryptedPrivateKey(burner.id);
      if (encryptedKey) {
        backup.burners.push({
          id: burner.id,
          label: burner.label,
          publicKey: burner.publicKey,
          encryptedPrivateKey: encryptedKey,
          createdAt: burner.createdAt,
        });
      }
    }
    result.includedSections.burners = backup.burners.length;

    // Export stealth data
    if (isStorageReady()) {
      const encryptedSeed = await storageGet(STORAGE_KEYS.STEALTH_SEED);
      const indexStr = await storageGet(STORAGE_KEYS.STEALTH_INDEX);
      const stealthAddresses = await getStealthAddressesAsync();

      if (encryptedSeed || stealthAddresses.length > 0) {
        backup.stealth = {
          encryptedMasterSeed: encryptedSeed,
          index: parseInt(indexStr || '0', 10),
          addresses: stealthAddresses,
        };
        result.includedSections.stealthAddresses = stealthAddresses.length;
      }
    }

    // Export gasless data
    const feePayerAddr = getFeePayerAddress();
    const prepaidBurners = await getPrepaidBurnersAsync();

    if (feePayerAddr || prepaidBurners.length > 0) {
      backup.gasless = {
        feePayerAddress: feePayerAddr,
        prepaidBurners: prepaidBurners,
      };
      result.includedSections.gaslessBurners = prepaidBurners.length;
    }

    result.backup = backup;
    result.success = true;
  } catch (error) {
    console.error('Export failed:', error);
  }

  return result;
}

/**
 * Export burners only (backward compatible v2 format)
 */
export async function exportBurnersOnly(): Promise<LegacyBackupV2 | null> {
  try {
    const burners = await getStoredBurners();
    const backup: LegacyBackupV2 = {
      version: 2,
      timestamp: Date.now(),
      burners: [],
    };

    for (const burner of burners) {
      const encryptedKey = await getEncryptedPrivateKey(burner.id);
      if (encryptedKey) {
        backup.burners.push({
          id: burner.id,
          label: burner.label,
          publicKey: burner.publicKey,
          encryptedPrivateKey: encryptedKey,
          createdAt: burner.createdAt,
        });
      }
    }

    return backup;
  } catch {
    return null;
  }
}

/**
 * Validate backup format and detect version
 */
export function validateBackup(data: unknown): { valid: boolean; version: number; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, version: 0, error: 'Invalid backup format' };
  }

  const backup = data as Record<string, unknown>;

  if (!backup.version || typeof backup.version !== 'number') {
    return { valid: false, version: 0, error: 'Missing version field' };
  }

  if (!backup.burners || !Array.isArray(backup.burners)) {
    return { valid: false, version: backup.version as number, error: 'Missing burners array' };
  }

  // Validate burner format
  for (const burner of backup.burners as unknown[]) {
    if (typeof burner !== 'object' || !burner) continue;
    const b = burner as Record<string, unknown>;
    if (!b.id || !b.publicKey || !b.encryptedPrivateKey) {
      return { valid: false, version: backup.version as number, error: 'Invalid burner format' };
    }
  }

  return { valid: true, version: backup.version as number };
}

/**
 * Import wallet data from backup
 * Supports both v2 (burners only) and v3 (complete) formats
 */
export async function importCompleteWallet(
  backupJson: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    imported: {
      burners: 0,
      stealthAddresses: 0,
      gaslessBurners: 0,
    },
    errors: [],
  };

  try {
    const data = JSON.parse(backupJson);
    const validation = validateBackup(data);

    if (!validation.valid) {
      result.errors.push(validation.error || 'Invalid backup');
      return result;
    }

    // Import burners (works for v2 and v3)
    const existingBurners = await getStoredBurners();
    const existingIds = new Set(existingBurners.map(b => b.id));

    for (const burner of data.burners) {
      if (existingIds.has(burner.id)) {
        result.errors.push(`${burner.label}: Already exists, skipped`);
        continue;
      }

      try {
        // Store encrypted key
        if (isStorageReady()) {
          await storageSet(STORAGE_KEYS.BURNER_KEY(burner.id), burner.encryptedPrivateKey);
        } else if (typeof window !== 'undefined') {
          localStorage.setItem(`shade_key_${burner.id}`, burner.encryptedPrivateKey);
        }

        // Add to burner list
        const newBurner: BurnerWallet = {
          id: burner.id,
          label: burner.label,
          publicKey: burner.publicKey,
          createdAt: burner.createdAt,
        };
        existingBurners.push(newBurner);
        existingIds.add(burner.id);
        result.imported.burners++;
      } catch (err) {
        result.errors.push(`${burner.label}: Import failed`);
      }
    }

    // Save updated burner list
    if (result.imported.burners > 0) {
      const burnersJson = JSON.stringify(existingBurners);
      if (isStorageReady()) {
        await storageSet(STORAGE_KEYS.BURNER_LIST, burnersJson);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('shade_burners', burnersJson);
      }
    }

    // Import stealth data (v3 only)
    if (validation.version >= 3 && data.stealth && isStorageReady()) {
      try {
        if (data.stealth.encryptedMasterSeed) {
          await storageSet(STORAGE_KEYS.STEALTH_SEED, data.stealth.encryptedMasterSeed);
        }
        if (data.stealth.index) {
          await storageSet(STORAGE_KEYS.STEALTH_INDEX, data.stealth.index.toString());
        }
        if (data.stealth.addresses && data.stealth.addresses.length > 0) {
          await storageSet(STORAGE_KEYS.STEALTH_ADDRESSES, JSON.stringify(data.stealth.addresses));
          result.imported.stealthAddresses = data.stealth.addresses.length;
        }
      } catch (err) {
        result.errors.push('Stealth data import failed');
      }
    }

    // Import gasless data (v3 only)
    if (validation.version >= 3 && data.gasless) {
      try {
        if (data.gasless.feePayerAddress) {
          setFeePayerAddress(data.gasless.feePayerAddress);
        }
        if (data.gasless.prepaidBurners && data.gasless.prepaidBurners.length > 0) {
          const existing = await getPrepaidBurnersAsync();
          const existingPrepaidIds = new Set(existing.map(b => b.id));

          for (const prepaid of data.gasless.prepaidBurners) {
            if (!existingPrepaidIds.has(prepaid.id)) {
              existing.push(prepaid);
              result.imported.gaslessBurners++;
            }
          }

          const prepaidJson = JSON.stringify(existing);
          if (isStorageReady()) {
            await storageSet(STORAGE_KEYS.PREPAID_BURNERS, prepaidJson);
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('shade_prepaid_burners', prepaidJson);
          }
        }
      } catch (err) {
        result.errors.push('Gasless data import failed');
      }
    }

    result.success =
      result.imported.burners > 0 ||
      result.imported.stealthAddresses > 0 ||
      result.imported.gaslessBurners > 0;
  } catch (error) {
    result.errors.push('Failed to parse backup file');
  }

  return result;
}

/**
 * Download backup as JSON file
 */
export function downloadBackup(
  backup: CompleteBackup | LegacyBackupV2,
  filename?: string
): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const dateStr = new Date().toISOString().slice(0, 10);
  const isComplete = 'stealth' in backup || 'gasless' in backup;
  const defaultFilename = isComplete
    ? `shade-complete-backup-${dateStr}.json`
    : `shade-burners-backup-${dateStr}.json`;

  a.download = filename || defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get backup summary (what's included)
 */
export async function getBackupSummary(): Promise<{
  burners: number;
  stealthAddresses: number;
  gaslessBurners: number;
  hasStealthSeed: boolean;
  hasFeePayerConfig: boolean;
}> {
  const burners = await getStoredBurners();
  const stealthAddresses = await getStealthAddressesAsync();
  const prepaidBurners = await getPrepaidBurnersAsync();

  let hasStealthSeed = false;
  if (isStorageReady()) {
    const seed = await storageGet(STORAGE_KEYS.STEALTH_SEED);
    hasStealthSeed = !!seed;
  }

  return {
    burners: burners.length,
    stealthAddresses: stealthAddresses.length,
    gaslessBurners: prepaidBurners.length,
    hasStealthSeed,
    hasFeePayerConfig: !!getFeePayerAddress(),
  };
}
