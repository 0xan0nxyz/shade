// Stealth address utilities - Zero-knowledge privacy for Solana
// Uses SecureKeyManager for proper encryption

import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';

// Helper to get a proper ArrayBuffer from Uint8Array (fixes TS strict mode issues)
function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}
import {
  secureKeyManager,
  storageGet,
  storageSet,
  storageDelete,
  isStorageReady,
  STORAGE_KEYS
} from './storage';
import { getConnection } from './solana';

// Legacy storage keys (for migration)
const STEALTH_MASTER_SEED = 'shade_stealth_master_seed';
const STEALTH_INDEX = 'shade_stealth_index';
const STEALTH_ADDRESSES = 'shade_stealth_addresses';

export interface StealthMetaAddress {
  scanPubkey: string;
  spendPubkey: string;
}

export interface StealthAddress {
  index: number;
  address: string;
  scanKey: string; // Encrypted
  createdAt: number;
  label?: string;
  spent: boolean;
}

// Helper: hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper: Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: SHA256 hash
async function sha256(message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', toArrayBuffer(data));
  return new Uint8Array(hashBuffer);
}

// Encrypt data using SecureKeyManager (proper key derivation)
async function encrypt(data: string, purpose: string): Promise<string> {
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked');
  }

  const encrypted = await secureKeyManager.encrypt(data, `stealth:${purpose}`);
  return JSON.stringify(encrypted);
}

// Decrypt data using SecureKeyManager
async function decrypt(encryptedData: string, purpose: string): Promise<string | null> {
  try {
    // Check if it's new format or legacy
    try {
      const parsed = JSON.parse(encryptedData);
      if (parsed.ciphertext && secureKeyManager.isActive()) {
        // New format - decrypt with SecureKeyManager
        return await secureKeyManager.decrypt(parsed, `stealth:${purpose}`);
      } else if (parsed.legacy) {
        // Legacy format wrapped
        return decryptLegacy(parsed.data, purpose);
      }
    } catch {
      // Legacy base64 format
      return decryptLegacy(encryptedData, purpose);
    }
    return null;
  } catch {
    return null;
  }
}

// Decrypt legacy data (weak padding - for migration only)
async function decryptLegacy(encryptedData: string, password: string): Promise<string | null> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const combined = Buffer.from(encryptedData, 'base64');
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // LEGACY: Uses password padding (INSECURE - only for migration)
    const key = await crypto.subtle.importKey(
      'raw',
      toArrayBuffer(encoder.encode(password.padEnd(32, '0').slice(0, 32))),
      'AES-GCM',
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(new Uint8Array(iv)) },
      key,
      toArrayBuffer(new Uint8Array(data))
    );

    return decoder.decode(decrypted);
  } catch {
    return null;
  }
}

// Get or create master seed
export async function getOrCreateMasterSeed(password: string): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Browser only');

  // Try new storage first
  if (isStorageReady()) {
    const stored = await storageGet(STORAGE_KEYS.STEALTH_SEED);
    if (stored) {
      // Check if legacy wrapped
      try {
        const parsed = JSON.parse(stored);
        if (parsed.legacy && parsed.needsReencryption) {
          // Decrypt legacy and re-encrypt
          const decrypted = await decryptLegacy(parsed.data, password);
          if (decrypted) {
            const reencrypted = await encrypt(decrypted, 'master_seed');
            await storageSet(STORAGE_KEYS.STEALTH_SEED, reencrypted);
            return decrypted;
          }
        } else if (parsed.ciphertext) {
          return await secureKeyManager.decrypt(parsed, 'stealth:master_seed');
        }
      } catch {
        // Try as new encrypted format
        const parsed = JSON.parse(stored);
        return await secureKeyManager.decrypt(parsed, 'stealth:master_seed');
      }
    }
  }

  // Try legacy localStorage
  const legacy = localStorage.getItem(STEALTH_MASTER_SEED);
  if (legacy) {
    const decrypted = await decryptLegacy(legacy, password);
    if (decrypted) {
      // Re-encrypt with new method if storage ready
      if (isStorageReady() && secureKeyManager.isActive()) {
        const reencrypted = await encrypt(decrypted, 'master_seed');
        await storageSet(STORAGE_KEYS.STEALTH_SEED, reencrypted);
      }
      return decrypted;
    }
  }

  // Create new seed
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked');
  }

  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const seed = bytesToHex(randomBytes);

  // Encrypt and store
  const encrypted = await encrypt(seed, 'master_seed');

  if (isStorageReady()) {
    await storageSet(STORAGE_KEYS.STEALTH_SEED, encrypted);
  } else {
    localStorage.setItem(STEALTH_MASTER_SEED, encrypted);
  }

  return seed;
}

// Check if stealth is initialized
export async function isStealthInitialized(password: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Check new storage first
    if (isStorageReady()) {
      const stored = await storageGet(STORAGE_KEYS.STEALTH_SEED);
      if (stored) {
        const decrypted = await decrypt(stored, 'master_seed');
        return decrypted !== null;
      }
    }

    // Check legacy localStorage
    const encrypted = localStorage.getItem(STEALTH_MASTER_SEED);
    if (!encrypted) return false;

    const decrypted = await decryptLegacy(encrypted, password);
    return decrypted !== null;
  } catch {
    return false;
  }
}

// Derive scan/spend keypairs from master seed
export async function deriveStealthKeypairs(masterSeed: string): Promise<{
  scanKeypair: Keypair;
  spendKeypair: Keypair;
}> {
  const scanHash = await sha256(masterSeed + ':scan');
  const scanKeypair = Keypair.fromSeed(scanHash);
  
  const spendHash = await sha256(masterSeed + ':spend');
  const spendKeypair = Keypair.fromSeed(spendHash);
  
  return { scanKeypair, spendKeypair };
}

// Get stealth meta-address (for sharing)
export async function getStealthMetaAddress(password: string): Promise<StealthMetaAddress | null> {
  try {
    const masterSeed = await getOrCreateMasterSeed(password);
    const { scanKeypair, spendKeypair } = await deriveStealthKeypairs(masterSeed);
    
    return {
      
      scanPubkey: scanKeypair.publicKey.toBase58(),
      spendPubkey: spendKeypair.publicKey.toBase58(),
    };
  } catch {
    return null;
  }
}

// Generate new one-time stealth address
export async function generateStealthAddress(password: string, label?: string): Promise<StealthAddress | null> {
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked');
  }

  try {
    const masterSeed = await getOrCreateMasterSeed(password);

    // Get current index
    let index: number;
    if (isStorageReady()) {
      const storedIndex = await storageGet(STORAGE_KEYS.STEALTH_INDEX);
      index = parseInt(storedIndex || '0', 10);
      await storageSet(STORAGE_KEYS.STEALTH_INDEX, (index + 1).toString());
    } else {
      index = parseInt(localStorage.getItem(STEALTH_INDEX) || '0', 10);
      localStorage.setItem(STEALTH_INDEX, (index + 1).toString());
    }

    // Derive keypair for this index
    const hash = await sha256(masterSeed + ':stealth:' + index);
    const keypair = Keypair.fromSeed(hash);

    // Encrypt the private key with SecureKeyManager
    const encryptedKey = await encrypt(bytesToHex(keypair.secretKey), `address_${index}`);

    const stealthAddress: StealthAddress = {
      index,
      address: keypair.publicKey.toBase58(),
      scanKey: encryptedKey,
      createdAt: Date.now(),
      label: label || `Stealth_${index}`,
      spent: false,
    };

    // Store the address
    const addresses = await getStealthAddressesAsync();
    addresses.push(stealthAddress);

    const data = JSON.stringify(addresses);
    if (isStorageReady()) {
      await storageSet(STORAGE_KEYS.STEALTH_ADDRESSES, data);
    }
    localStorage.setItem(STEALTH_ADDRESSES, data);

    return {
      scanKey: stealthAddress.scanKey,
      index: stealthAddress.index,
      address: stealthAddress.address,
      createdAt: stealthAddress.createdAt,
      label: stealthAddress.label,
      spent: stealthAddress.spent,
    };
  } catch (error) {
    console.error('Failed to generate stealth address:', error);
    return null;
  }
}

// Get stored stealth addresses (sync version for backward compatibility)
export function getStealthAddresses(): StealthAddress[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STEALTH_ADDRESSES);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Get stored stealth addresses (async version using new storage)
export async function getStealthAddressesAsync(): Promise<StealthAddress[]> {
  if (typeof window === 'undefined') return [];

  try {
    // Try new storage first
    if (isStorageReady()) {
      const stored = await storageGet(STORAGE_KEYS.STEALTH_ADDRESSES);
      if (stored) return JSON.parse(stored);
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(STEALTH_ADDRESSES);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Sweep funds from stealth address
export async function sweepStealthAddress(
  index: number,
  password: string,
  destinationAddress: string
): Promise<string | null> {
  try {
    const masterSeed = await getOrCreateMasterSeed(password);
    const hash = await sha256(masterSeed + ':stealth:' + index);
    const keypair = Keypair.fromSeed(hash);

    const connection = getConnection();
    const destPubkey = new PublicKey(destinationAddress);
    const balance = await connection.getBalance(keypair.publicKey);

    // Leave minimum for account
    const minBalance = 5000;
    const sendAmount = balance - minBalance;

    if (sendAmount <= 0) {
      throw new Error('Insufficient balance');
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

    // Mark as spent
    const addresses = await getStealthAddressesAsync();
    const addr = addresses.find(a => a.index === index);
    if (addr) {
      addr.spent = true;
      const data = JSON.stringify(addresses);
      if (isStorageReady()) {
        await storageSet(STORAGE_KEYS.STEALTH_ADDRESSES, data);
      }
      localStorage.setItem(STEALTH_ADDRESSES, data);
    }

    return signature;
  } catch (error) {
    console.error('Sweep failed:', error);
    return null;
  }
}

// Delete all stealth data
export async function clearStealthData(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear from new storage
  if (isStorageReady()) {
    await storageDelete(STORAGE_KEYS.STEALTH_SEED);
    await storageDelete(STORAGE_KEYS.STEALTH_INDEX);
    await storageDelete(STORAGE_KEYS.STEALTH_ADDRESSES);
  }

  // Clear from localStorage
  localStorage.removeItem(STEALTH_MASTER_SEED);
  localStorage.removeItem(STEALTH_INDEX);
  localStorage.removeItem(STEALTH_ADDRESSES);
}
