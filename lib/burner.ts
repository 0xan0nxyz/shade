// Burner wallet utilities - Zero-knowledge privacy-focused
// Uses SecureKeyManager for proper AES-GCM encryption with PBKDF2 key derivation

import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import {
  secureKeyManager,
  storageGet,
  storageSet,
  storageDelete,
  storageKeys,
  isStorageReady,
  STORAGE_KEYS
} from './storage';
import { getConnection } from './solana';

export interface BurnerWallet {
  id: string;
  label: string;
  publicKey: string;
  createdAt: number;
}

export interface BurnerWithBalance extends BurnerWallet {
  balance: number;
}

export interface BackupData {
  version: number;
  timestamp: number;
  burners: {
    id: string;
    label: string;
    publicKey: string;
    encryptedPrivateKey: string;
    createdAt: number;
  }[];
}

// Storage keys
const BURNER_LIST_KEY = 'shade_burners';

// Generate unique ID
export function generateId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// Get stored burners (without private keys)
export async function getStoredBurners(): Promise<BurnerWallet[]> {
  if (typeof window === 'undefined') return [];

  try {
    // Try new storage system first
    if (isStorageReady()) {
      const stored = await storageGet(STORAGE_KEYS.BURNER_LIST);
      if (stored) return JSON.parse(stored);
    }

    // Fallback to legacy localStorage
    const stored = localStorage.getItem(BURNER_LIST_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Sync version for backward compatibility (reads from localStorage only)
export function getStoredBurnersSync(): BurnerWallet[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(BURNER_LIST_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save burners to storage
async function saveBurners(burners: BurnerWallet[]): Promise<void> {
  if (typeof window === 'undefined') return;

  const data = JSON.stringify(burners);

  // Save to new storage if ready
  if (isStorageReady()) {
    await storageSet(STORAGE_KEYS.BURNER_LIST, data);
  }

  // Also save to localStorage for backward compatibility during migration
  localStorage.setItem(BURNER_LIST_KEY, data);
}

// Get encrypted private key
export async function getEncryptedPrivateKey(id: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  // Try new storage first
  if (isStorageReady()) {
    const stored = await storageGet(STORAGE_KEYS.BURNER_KEY(id));
    if (stored) return stored;
  }

  // Fallback to legacy localStorage
  return localStorage.getItem(`shade_key_${id}`);
}

// Secure AES-GCM encryption for private keys using SecureKeyManager
async function encryptPrivateKey(data: string, burnerId: string): Promise<string> {
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked. Please unlock storage first.');
  }

  // Use SecureKeyManager with burner-specific purpose for key isolation
  const encrypted = await secureKeyManager.encrypt(data, `burner:${burnerId}`);
  return JSON.stringify(encrypted);
}

// Decrypt private key using SecureKeyManager
export async function decryptPrivateKey(id: string): Promise<Keypair | null> {
  if (typeof window === 'undefined') return null;

  try {
    // First try new storage system
    if (isStorageReady()) {
      const stored = await storageGet(STORAGE_KEYS.BURNER_KEY(id));
      if (stored) {
        // Check if it's legacy data that needs re-encryption
        try {
          const parsed = JSON.parse(stored);
          if (parsed.legacy && parsed.needsReencryption) {
            // Legacy data - decrypt with old method, re-encrypt with new
            const legacyKey = await decryptLegacyKey(id, parsed.data);
            if (legacyKey) {
              // Re-encrypt with proper method
              const reencrypted = await encryptPrivateKey(
                Buffer.from(legacyKey.secretKey).toString('base64'),
                id
              );
              await storageSet(STORAGE_KEYS.BURNER_KEY(id), reencrypted);
              return legacyKey;
            }
          } else if (parsed.ciphertext) {
            // New format - decrypt with SecureKeyManager
            const decrypted = await secureKeyManager.decrypt(parsed, `burner:${id}`);
            const secretKey = Buffer.from(decrypted, 'base64');
            return Keypair.fromSecretKey(new Uint8Array(secretKey));
          }
        } catch {
          // Try as direct encrypted data
          const parsed = JSON.parse(stored);
          const decrypted = await secureKeyManager.decrypt(parsed, `burner:${id}`);
          const secretKey = Buffer.from(decrypted, 'base64');
          return Keypair.fromSecretKey(new Uint8Array(secretKey));
        }
      }
    }

    // Fallback to legacy localStorage (for unmigrated data)
    const encrypted = localStorage.getItem(`shade_key_${id}`);
    if (!encrypted) return null;

    return decryptLegacyKey(id, encrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// Decrypt legacy key (for backward compatibility)
async function decryptLegacyKey(id: string, encrypted: string): Promise<Keypair | null> {
  try {
    const encoder = new TextEncoder();
    const combined = Buffer.from(encrypted, 'base64');
    const data = new Uint8Array(combined);

    // Extract salt, iv, and encrypted data (legacy format)
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encryptedData = data.slice(28);

    // Legacy: derive key using wallet ID as password (insecure, but needed for migration)
    const passwordBuffer = encoder.encode(id);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const secretKey = new Uint8Array(decrypted);
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('Legacy decryption failed:', error);
    return null;
  }
}

// Create new burner wallet
export async function createBurner(label?: string): Promise<BurnerWallet> {
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked. Please unlock storage first.');
  }

  const keypair = Keypair.generate();
  const id = generateId();

  // Store private key encrypted with SecureKeyManager
  const privateKeyBase64 = Buffer.from(keypair.secretKey).toString('base64');
  const encryptedKey = await encryptPrivateKey(privateKeyBase64, id);

  const burner: BurnerWallet = {
    id,
    label: label || `BURNER_${Date.now().toString().slice(-6)}`,
    publicKey: keypair.publicKey.toBase58(),
    createdAt: Date.now(),
  };

  // Save encrypted private key to secure storage
  if (isStorageReady()) {
    await storageSet(STORAGE_KEYS.BURNER_KEY(id), encryptedKey);
  } else if (typeof window !== 'undefined') {
    // Fallback to localStorage if storage not ready (shouldn't happen normally)
    localStorage.setItem(`shade_key_${id}`, encryptedKey);
  }

  const burners = await getStoredBurners();
  burners.push(burner);
  await saveBurners(burners);

  return {
    id: burner.id,
    label: burner.label,
    publicKey: burner.publicKey,
    createdAt: burner.createdAt,
  };
}

// Export all burners with encrypted keys (for backup)
export async function exportBurners(password: string): Promise<BackupData | null> {
  try {
    const burners = await getStoredBurners();
    const backup: BackupData = {
      version: 2, // New version for secure encryption
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

// Download backup as file
export function downloadBackup(backup: BackupData, filename?: string): void {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `shade-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import burners from backup
export async function importBurners(backupJson: string, password: string): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const result = { success: false, imported: 0, errors: [] as string[] };

  try {
    const backup: BackupData = JSON.parse(backupJson);

    if (!backup.version || !backup.burners) {
      result.errors.push('Invalid backup format');
      return result;
    }

    const existingBurners = await getStoredBurners();
    const existingIds = new Set(existingBurners.map(b => b.id));

    for (const burner of backup.burners) {
      try {
        if (existingIds.has(burner.id)) {
          result.errors.push(`${burner.label}: Already exists`);
          continue;
        }

        // Validate encrypted key format
        try {
          const parsed = JSON.parse(burner.encryptedPrivateKey);
          // New format has ciphertext field
          if (!parsed.ciphertext && !parsed.legacy) {
            // Legacy base64 format - validate length
            const combined = Buffer.from(burner.encryptedPrivateKey, 'base64');
            if (combined.length < 28) {
              result.errors.push(`${burner.label}: Invalid key format`);
              continue;
            }
          }
        } catch {
          // Legacy base64 format
          const combined = Buffer.from(burner.encryptedPrivateKey, 'base64');
          if (combined.length < 28) {
            result.errors.push(`${burner.label}: Invalid key format`);
            continue;
          }
        }

        // Store in new storage if ready, otherwise localStorage
        if (isStorageReady()) {
          await storageSet(STORAGE_KEYS.BURNER_KEY(burner.id), burner.encryptedPrivateKey);
        } else {
          localStorage.setItem(`shade_key_${burner.id}`, burner.encryptedPrivateKey);
        }

        const newBurner: BurnerWallet = {
          id: burner.id,
          label: burner.label,
          publicKey: burner.publicKey,
          createdAt: burner.createdAt,
        };

        existingBurners.push(newBurner);
        existingIds.add(burner.id);
        result.imported++;
      } catch (error) {
        result.errors.push(`${burner.label}: ${error}`);
      }
    }

    await saveBurners(existingBurners);
    result.success = result.imported > 0;

  } catch (error) {
    result.errors.push('Failed to parse backup file');
  }

  return result;
}

// Clear all burners (for factory reset)
export async function clearAllBurners(): Promise<void> {
  if (typeof window === 'undefined') return;

  const burners = await getStoredBurners();

  // Clear from new storage
  if (isStorageReady()) {
    for (const burner of burners) {
      await storageDelete(STORAGE_KEYS.BURNER_KEY(burner.id));
    }
    await storageDelete(STORAGE_KEYS.BURNER_LIST);
  }

  // Clear from legacy localStorage
  for (const burner of burners) {
    localStorage.removeItem(`shade_key_${burner.id}`);
  }
  localStorage.removeItem(BURNER_LIST_KEY);
}

// Get burner balance
export async function getBurnerBalance(publicKey: string): Promise<number> {
  try {
    const connection = getConnection();
    const pubkey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

// Sweep funds from burner to destination
export async function sweepBurner(burnerId: string, destinationAddress: string): Promise<string> {
  const keypair = await decryptPrivateKey(burnerId);
  if (!keypair) {
    throw new Error('Failed to decrypt burner private key');
  }

  const connection = getConnection();
  const destPubkey = new PublicKey(destinationAddress);
  const balance = await connection.getBalance(keypair.publicKey);

  // Leave minimum balance for account deletion
  const minBalance = 5000;
  const sendAmount = balance - minBalance;

  if (sendAmount <= 0) {
    throw new Error('Insufficient balance to sweep');
  }

  const { blockhash } = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: keypair.publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: destPubkey,
      lamports: sendAmount,
    })
  );

  transaction.sign(keypair);
  const signature = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

// Destroy burner wallet
export async function destroyBurner(id: string): Promise<void> {
  // Remove from new storage
  if (isStorageReady()) {
    await storageDelete(STORAGE_KEYS.BURNER_KEY(id));
  }

  // Remove from legacy localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`shade_key_${id}`);
  }

  const burners = await getStoredBurners();
  const updated = burners.filter(b => b.id !== id);
  await saveBurners(updated);
}

// Get all burners with balances
export async function getBurnersWithBalances(): Promise<BurnerWithBalance[]> {
  const burners = await getStoredBurners();
  const result: BurnerWithBalance[] = [];

  for (const burner of burners) {
    const balance = await getBurnerBalance(burner.publicKey);
    result.push({ ...burner, balance });
  }

  return result;
}
