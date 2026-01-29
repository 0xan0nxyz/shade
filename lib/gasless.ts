// Gasless transactions - Fee payer sponsorship model
// Users pay gas from a separate address they control
// Uses SecureKeyManager for proper encryption (no hardcoded keys)

import { Transaction, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

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
const FEE_PAYER_ADDRESS = 'shade_fee_payer_address';
const PREPAID_BURNERS = 'shade_prepaid_burners';

export interface PrepaidBurner {
  id: string;
  address: string;
  keypair: string; // Encrypted secret key
  solBalance: number;
  createdAt: number;
}

export interface GaslessConfig {
  enabled: boolean;
  feePayerAddress: string;
  usePrepaidBurner: boolean;
}

// Get stored fee payer address
export function getFeePayerAddress(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(FEE_PAYER_ADDRESS);
}

// Set fee payer address
export function setFeePayerAddress(address: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FEE_PAYER_ADDRESS, address);
}

// Check if gasless mode is configured
export function isGaslessConfigured(): boolean {
  return !!getFeePayerAddress();
}

// Create a prepaid burner (pre-funded address for gas)
export async function createPrepaidBurner(
  label: string,
  fundAmount: number = 0.01 // SOL
): Promise<PrepaidBurner | null> {
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked');
  }

  try {
    const keypair = Keypair.generate();
    const id = Buffer.from(keypair.secretKey.slice(0, 8)).toString('hex');

    // Encrypt the keypair with SecureKeyManager
    const encryptedKey = await encryptKeypair(keypair.secretKey, id);

    const burner: PrepaidBurner = {
      id,
      address: keypair.publicKey.toBase58(),
      keypair: encryptedKey,
      solBalance: 0,
      createdAt: Date.now(),
    };

    // Store in new storage if ready
    const burners = await getPrepaidBurnersAsync();
    burners.push(burner);

    if (isStorageReady()) {
      await storageSet(STORAGE_KEYS.PREPAID_BURNERS, JSON.stringify(burners));
    }
    // Also store in localStorage for compatibility
    localStorage.setItem(PREPAID_BURNERS, JSON.stringify(burners));

    return burner;
  } catch (error) {
    console.error('Failed to create prepaid burner:', error);
    return null;
  }
}

// Get stored prepaid burners (sync version for backward compatibility)
export function getPrepaidBurners(): PrepaidBurner[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PREPAID_BURNERS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get stored prepaid burners (async version using new storage)
export async function getPrepaidBurnersAsync(): Promise<PrepaidBurner[]> {
  if (typeof window === 'undefined') return [];

  try {
    // Try new storage first
    if (isStorageReady()) {
      const stored = await storageGet(STORAGE_KEYS.PREPAID_BURNERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if it's legacy wrapped data
        if (parsed.legacy) {
          return JSON.parse(parsed.data);
        }
        return parsed;
      }
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(PREPAID_BURNERS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Delete prepaid burner
export async function deletePrepaidBurner(id: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const burners = (await getPrepaidBurnersAsync()).filter(b => b.id !== id);
  const data = JSON.stringify(burners);

  // Update new storage
  if (isStorageReady()) {
    await storageSet(STORAGE_KEYS.PREPAID_BURNERS, data);
  }

  // Update localStorage for compatibility
  localStorage.setItem(PREPAID_BURNERS, data);
}

// Encrypt keypair using SecureKeyManager (proper key derivation)
async function encryptKeypair(secretKey: Uint8Array, burnerId: string): Promise<string> {
  if (!secureKeyManager.isActive()) {
    throw new Error('SecureKeyManager not unlocked');
  }

  const data = Buffer.from(secretKey).toString('base64');
  const encrypted = await secureKeyManager.encrypt(data, `gasless:${burnerId}`);
  return JSON.stringify(encrypted);
}

// Decrypt keypair using SecureKeyManager
async function decryptKeypair(encrypted: string, burnerId: string): Promise<Uint8Array | null> {
  try {
    // Check if it's new format (JSON with ciphertext) or legacy
    let decrypted: string;

    try {
      const parsed = JSON.parse(encrypted);
      if (parsed.ciphertext && secureKeyManager.isActive()) {
        // New format - decrypt with SecureKeyManager
        decrypted = await secureKeyManager.decrypt(parsed, `gasless:${burnerId}`);
      } else if (parsed.legacy) {
        // Legacy format wrapped in migration marker
        return decryptLegacyKeypair(parsed.data);
      } else {
        // Unknown format
        return null;
      }
    } catch {
      // Legacy base64 format
      return decryptLegacyKeypair(encrypted);
    }

    return Uint8Array.from(Buffer.from(decrypted, 'base64'));
  } catch {
    return null;
  }
}

// Decrypt legacy keypair (hardcoded key - for migration only)
async function decryptLegacyKeypair(encrypted: string): Promise<Uint8Array | null> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const combined = Buffer.from(encrypted, 'base64');
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    // LEGACY: Uses hardcoded key (INSECURE - only for migration)
    const keyData = encoder.encode('shade-gasless-key-2026');
    const key = await crypto.subtle.importKey(
      'raw',
      toArrayBuffer(keyData),
      'AES-GCM',
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(new Uint8Array(iv)) },
      key,
      toArrayBuffer(new Uint8Array(data))
    );

    const decoded = decoder.decode(decrypted);
    return Uint8Array.from(Buffer.from(decoded, 'base64'));
  } catch {
    return null;
  }
}

// Sign and send transaction with fee payer
export async function sendWithFeePayer(
  transaction: Transaction,
  mainKeypair: Keypair,
  feePayerKeypair?: Keypair
): Promise<string | null> {
  try {
    // Use provided fee payer or get from storage
    const payer = feePayerKeypair || await getFeePayerKeypair();

    if (!payer) {
      throw new Error('No fee payer configured');
    }

    // Set fee payer
    transaction.feePayer = payer.publicKey;

    // Sign with main wallet
    transaction.sign(mainKeypair);

    // Sign with fee payer
    transaction.sign(payer);

    // Send
    const connection = getConnection();
    const signature = await connection.sendRawTransaction(
      transaction.serialize()
    );

    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Gasless send failed:', error);
    return null;
  }
}

// Get fee payer keypair from storage
async function getFeePayerKeypair(): Promise<Keypair | null> {
  const address = getFeePayerAddress();
  if (!address) return null;

  const burners = await getPrepaidBurnersAsync();
  const burner = burners.find(b => b.address === address);

  if (!burner) return null;

  const secretKey = await decryptKeypair(burner.keypair, burner.id);
  if (!secretKey) return null;

  return Keypair.fromSecretKey(secretKey);
}

// Estimate transaction fee
export async function estimateFee(
  transaction: Transaction,
  feePayerAddress: string
): Promise<number> {
  try {
    const connection = getConnection();
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(feePayerAddress);

    // Simplified: use default fee estimate
    return 5000 * Math.max(transaction.signatures.length, 1);
  } catch {
    return 5000; // Default estimated fee
  }
}

// Clear all gasless configuration
export async function clearGaslessConfig(): Promise<void> {
  if (typeof window === 'undefined') return;

  // Clear from new storage
  if (isStorageReady()) {
    await storageDelete(STORAGE_KEYS.FEE_PAYER);
    await storageDelete(STORAGE_KEYS.PREPAID_BURNERS);
  }

  // Clear from localStorage
  localStorage.removeItem(FEE_PAYER_ADDRESS);
  localStorage.removeItem(PREPAID_BURNERS);
}

// Get gasless statistics
export async function getGaslessStats(): Promise<{
  configured: boolean;
  prepaidCount: number;
  totalPrepaidSol: number;
}> {
  const burners = await getPrepaidBurnersAsync();
  const connection = getConnection();

  let totalSol = 0;
  for (const burner of burners) {
    try {
      const balance = await connection.getBalance(new PublicKey(burner.address));
      totalSol += balance / LAMPORTS_PER_SOL;
    } catch {
      // Skip if can't fetch
    }
  }

  return {
    configured: isGaslessConfigured(),
    prepaidCount: burners.length,
    totalPrepaidSol: totalSol,
  };
}
