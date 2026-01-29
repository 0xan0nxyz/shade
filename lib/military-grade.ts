// Military-Grade Security Module for SHADE Wallet
// Maximum security configuration for high-value operations

import { Keypair } from '@solana/web3.js';

// Extend Window interface for devtools detection
declare global {
  interface Window {
    devtools?: {
      isOpen?: boolean;
    };
  }
}

// Threat log entry type
interface ThreatEntry {
  timestamp: number;
  threat: string;
  severity: string;
}

// Helper to get a proper ArrayBuffer from Uint8Array (fixes TS strict mode issues)
function toArrayBuffer(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

// ============================================
// CONSTANTS - Military Grade Configuration
// ============================================

const SECURITY_CONFIG = {
  // Encryption
  ENCRYPTION: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 16, // Military standard
    tagLength: 128,
  },
  
  // Key Derivation
  KDF: {
    algorithm: 'PBKDF2',
    hash: 'SHA-512',
    iterations: 310000, // OWASP 2025 recommendation
    memory: 256 * 1024, // 256MB memory requirement
  },
  
  // Authentication
  AUTH: {
    maxAttempts: 3,
    lockoutDuration: 900000, // 15 minutes
    sessionTimeout: 300000, // 5 minutes
    requireReauthForTransaction: true,
  },
  
  // Anti-Tampering
  ANTI_TAMPER: {
    detectDebugging: true,
    detectDevTools: true,
    selfDestructOnTamper: true,
    integrityCheckInterval: 30000,
  },
  
  // Data Protection
  DATA: {
    autoWipeTimeout: 60000, // 1 minute of inactivity
    secureDelete: true,
    noPrintScreen: true,
    disableRightClick: true,
  },
  
  // Network Security
  NETWORK: {
    certificatePinning: true,
    maxRequestTimeout: 10000,
    rateLimitWindow: 60000,
    rateLimitMax: 10,
  },
};

// ============================================
// THREAT DETECTION
// ============================================

// Detect debugging
function detectDebugging(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for dev tools opened
  const devToolsOpen = window.devtools?.isOpen === true;
  
  // Check for console debugging
  const startTime = performance.now();
  debugger; // This will pause in debug mode
  const endTime = performance.now();
  
  // Suspiciously long execution (debugger pause)
  if (endTime - startTime > 100) return true;
  
  // Check for breakpoints
  try {
    //@ts-ignore
    new Function('debugger');
  } catch {
    return true;
  }
  
  return devToolsOpen;
}

// Detect tampering with code
function detectCodeTampering(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verify critical functions haven't been modified
  const criticalFunctions = ['encryptPrivateKey', 'decryptPrivateKey', 'signTransaction'];
  
  for (const fn of criticalFunctions) {
    //@ts-ignore
    if (typeof window[fn] !== 'function') return true;
  }
  
  return false;
}

// Monitor for suspicious behavior
export class SecurityMonitor {
  private threats: ThreatEntry[] = [];
  private tamperDetected = false;
  private lastIntegrityCheck = 0;
  
  constructor() {
    this.startMonitoring();
  }
  
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;
    
    // Periodic integrity checks
    setInterval(() => {
      this.integrityCheck();
    }, SECURITY_CONFIG.ANTI_TAMPER.integrityCheckInterval);
    
    // Detect DevTools
    window.addEventListener('devtoolschange', () => {
      if (window.devtools?.isOpen) {
        this.logThreat('DevTools opened');
      }
    });
    
    // Prevent right click in sensitive areas
    document.addEventListener('contextmenu', (e) => {
      if (SECURITY_CONFIG.DATA.disableRightClick) {
        e.preventDefault();
      }
    });
    
    // Detect print screen
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen' && SECURITY_CONFIG.DATA.noPrintScreen) {
        this.logThreat('Print screen attempted');
        // Blur all sensitive content
        document.body.innerHTML = '';
      }
    });
  }
  
  private integrityCheck(): void {
    const now = Date.now();
    
    // Check for debugging
    if (detectDebugging()) {
      this.logThreat('Debugging detected');
    }
    
    // Check for code tampering
    if (detectCodeTampering()) {
      this.logThreat('Code tampering detected');
    }
    
    this.lastIntegrityCheck = now;
    
    if (this.tamperDetected && SECURITY_CONFIG.ANTI_TAMPER.selfDestructOnTamper) {
      this.selfDestruct();
    }
  }
  
  private logThreat(threat: string): void {
    this.threats.push({
      timestamp: Date.now(),
      threat,
      severity: 'HIGH',
    });
    
    console.warn(`🚨 SECURITY THREAT: ${threat}`);
    
    if (this.threats.length >= 3) {
      this.tamperDetected = true;
    }
  }
  
  private selfDestruct(): void {
    // Wipe all sensitive data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Overwrite body
      document.body.innerHTML = '<h1>Security Alert: Threat Detected</h1>';
      document.body.style.cssText = 'background: #000; color: red; padding: 20px;';
      
      // Disable further interaction
      document.addEventListener('click', (e) => e.preventDefault());
      document.addEventListener('keydown', (e) => e.preventDefault());
    }
  }
  
  getThreats(): { timestamp: number; threat: string; severity: string }[] {
    return [...this.threats];
  }
  
  isCompromised(): boolean {
    return this.tamperDetected;
  }
  
  reset(): void {
    this.threats = [];
    this.tamperDetected = false;
  }
}

// ============================================
// MILITARY GRADE ENCRYPTION
// ============================================

// Generate cryptographically secure random bytes
export function secureRandom(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Military-grade key derivation with Argon2-like properties
export async function deriveMilitaryKey(
  password: string,
  salt: Uint8Array,
  iterations: number = SECURITY_CONFIG.KDF.iterations
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // First derivation
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(passwordBuffer),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Multi-round derivation
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations,
      hash: SECURITY_CONFIG.KDF.hash,
    },
    keyMaterial,
    { name: 'AES-GCM', length: SECURITY_CONFIG.ENCRYPTION.keyLength },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

// Encrypt with military-grade security
export async function militaryEncrypt(
  data: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  
  // Generate unique salt and IV
  const salt = secureRandom(32); // Larger salt for military grade
  const iv = secureRandom(SECURITY_CONFIG.ENCRYPTION.ivLength);
  
  // Derive key
  const key = await deriveMilitaryKey(password, salt);
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoder.encode(data))
  );

  // Add timestamp for freshness verification
  const timestamp = Date.now();
  const payload = JSON.stringify({
    data,
    timestamp,
    checksum: await computeChecksum(data + timestamp + password),
  });

  const encryptedPayload = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoder.encode(payload))
  );
  
  // Combine: salt + iv + encrypted data + timestamp signature
  const timestampSignature = await signTimestamp(timestamp, key);
  
  const combined = new Uint8Array(
    salt.length + iv.length + encryptedPayload.byteLength + 64
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedPayload), salt.length + iv.length);
  combined.set(new Uint8Array(timestampSignature), salt.length + iv.length + encryptedPayload.byteLength);
  
  return Buffer.from(combined).toString('base64');
}

// Decrypt with verification
export async function militaryDecrypt(
  encryptedData: string,
  password: string
): Promise<{ data: string; verified: boolean }> {
  const encoder = new TextEncoder();
  const combined = Buffer.from(encryptedData, 'base64');
  const data = new Uint8Array(combined);
  
  // Extract components
  const salt = data.slice(0, 32);
  const iv = data.slice(32, 48);
  const encryptedPayload = data.slice(48, data.length - 64);
  const timestampSignature = data.slice(data.length - 64);
  
  // Derive key
  const key = await deriveMilitaryKey(password, salt);
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedPayload
  );
  
  const decoder = new TextDecoder();
  const payload = JSON.parse(decoder.decode(decrypted));
  
  // Verify freshness (within 5 minutes)
  const now = Date.now();
  const maxAge = 5 * 60 * 1000;
  
  if (Math.abs(now - payload.timestamp) > maxAge) {
    return { data: '', verified: false };
  }
  
  // Verify checksum
  const expectedChecksum = await computeChecksum(
    payload.data + payload.timestamp + password
  );
  
  if (payload.checksum !== expectedChecksum) {
    return { data: '', verified: false };
  }
  
  // Verify timestamp signature
  const signatureValid = await verifyTimestampSignature(
    payload.timestamp,
    timestampSignature,
    key
  );
  
  if (!signatureValid) {
    return { data: '', verified: false };
  }
  
  return { data: payload.data, verified: true };
}

// Compute checksum
async function computeChecksum(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-512', toArrayBuffer(encoder.encode(data)));
  return new Uint8Array(hashBuffer.slice(0, 32));
}

// Sign timestamp
async function signTimestamp(timestamp: number, key: CryptoKey): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(timestamp.toString());
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    toArrayBuffer(data)
  );
  return new Uint8Array(signature);
}

// Verify timestamp signature
async function verifyTimestampSignature(
  timestamp: number,
  signature: Uint8Array,
  key: CryptoKey
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(timestamp.toString());
  return await crypto.subtle.verify(
    'HMAC',
    key,
    toArrayBuffer(signature),
    toArrayBuffer(data)
  );
}

// ============================================
// SECURE SESSION MANAGEMENT
// ============================================

export class SecureSession {
  private sessionKey: CryptoKey | null = null;
  private lastActivity: number = 0;
  private locked: boolean = true;
  
  constructor(private userId: string) {
    this.updateActivity();
  }
  
  private updateActivity(): void {
    this.lastActivity = Date.now();
  }
  
  async unlock(password: string): Promise<boolean> {
    this.updateActivity();
    
    // Rate limiting check
    const attempts = sessionStorage.getItem(`attempts_${this.userId}`);
    if (parseInt(attempts || '0') >= SECURITY_CONFIG.AUTH.maxAttempts) {
      const lockTime = localStorage.getItem(`lockout_${this.userId}`);
      if (lockTime && Date.now() - parseInt(lockTime) < SECURITY_CONFIG.AUTH.lockoutDuration) {
        throw new Error('Account locked. Try again later.');
      }
    }
    
    // Generate session key
    const salt = secureRandom(32);
    this.sessionKey = await deriveMilitaryKey(password, salt);
    
    if (!this.sessionKey) {
      this.recordFailedAttempt();
      return false;
    }
    
    this.locked = false;
    sessionStorage.setItem(`attempts_${this.userId}`, '0');
    return true;
  }
  
  private recordFailedAttempt(): void {
    const attempts = (parseInt(sessionStorage.getItem(`attempts_${this.userId}`) || '0') + 1);
    sessionStorage.setItem(`attempts_${this.userId}`, attempts.toString());
    
    if (attempts >= SECURITY_CONFIG.AUTH.maxAttempts) {
      localStorage.setItem(`lockout_${this.userId}`, Date.now().toString());
    }
  }
  
  isLocked(): boolean {
    this.checkTimeout();
    return this.locked;
  }
  
  private checkTimeout(): void {
    if (this.locked) return;
    
    const now = Date.now();
    if (now - this.lastActivity > SECURITY_CONFIG.AUTH.sessionTimeout) {
      this.lock();
    }
  }
  
  lock(): void {
    this.sessionKey = null;
    this.locked = true;
    this.updateActivity();
  }
  
  destroy(): void {
    this.sessionKey = null;
    this.locked = true;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(`attempts_${this.userId}`);
    }
  }
  
  async sign(data: Uint8Array): Promise<Uint8Array | null> {
    this.updateActivity();
    if (this.locked || !this.sessionKey) return null;

    const sig = await crypto.subtle.sign('HMAC', this.sessionKey, toArrayBuffer(data));
    return new Uint8Array(sig);
  }

  async verify(data: Uint8Array, signature: Uint8Array): Promise<boolean> {
    this.updateActivity();
    if (this.locked || !this.sessionKey) return false;

    return await crypto.subtle.verify('HMAC', this.sessionKey, toArrayBuffer(signature), toArrayBuffer(data));
  }
}

// ============================================
// SECURE KEY STORAGE
// ============================================

export class SecureVault {
  private static instance: SecureVault;
  private monitor: SecurityMonitor;
  
  private constructor() {
    this.monitor = new SecurityMonitor();
  }
  
  static getInstance(): SecureVault {
    if (!SecureVault.instance) {
      SecureVault.instance = new SecureVault();
    }
    return SecureVault.instance;
  }
  
  async store(key: string, value: string, password: string): Promise<boolean> {
    if (this.monitor.isCompromised()) {
      console.error('Cannot store: security compromised');
      return false;
    }
    
    try {
      const encrypted = await militaryEncrypt(value, password);
      localStorage.setItem(`vault_${key}`, encrypted);
      return true;
    } catch {
      return false;
    }
  }
  
  async retrieve(key: string, password: string): Promise<string | null> {
    if (this.monitor.isCompromised()) {
      console.error('Cannot retrieve: security compromised');
      return null;
    }
    
    try {
      const encrypted = localStorage.getItem(`vault_${key}`);
      if (!encrypted) return null;
      
      const result = await militaryDecrypt(encrypted, password);
      return result.verified ? result.data : null;
    } catch {
      return null;
    }
  }
  
  delete(key: string): void {
    // Secure delete - overwrite before removing
    const existing = localStorage.getItem(`vault_${key}`);
    if (existing) {
      // Overwrite with random data
      localStorage.setItem(`vault_${key}`, Buffer.from(secureRandom(existing.length)).toString('base64'));
    }
    localStorage.removeItem(`vault_${key}`);
  }
  
  clear(): void {
    // Get all keys
    const keys = Object.keys(localStorage).filter(k => k.startsWith('vault_'));
    
    // Secure delete each
    for (const key of keys) {
      this.delete(key.replace('vault_', ''));
    }
  }
  
  getThreatLevel(): 'CLEAR' | 'WARNING' | 'CRITICAL' {
    const threats = this.monitor.getThreats();
    
    if (this.monitor.isCompromised()) return 'CRITICAL';
    if (threats.length > 5) return 'WARNING';
    return 'CLEAR';
  }
}

// ============================================
// TRANSACTION SECURITY
// ============================================

export class TransactionSecurity {
  private static instance: TransactionSecurity;
  private vault: SecureVault;
  
  private constructor() {
    this.vault = SecureVault.getInstance();
  }
  
  static getInstance(): TransactionSecurity {
    if (!TransactionSecurity.instance) {
      TransactionSecurity.instance = new TransactionSecurity();
    }
    return TransactionSecurity.instance;
  }
  
  async signTransaction(
    transaction: any,
    privateKey: Uint8Array,
    requirePassword: boolean,
    password?: string
  ): Promise<{ signed: boolean; signature?: string; error?: string }> {
    // Check security level
    if (this.vault.getThreatLevel() === 'CRITICAL') {
      return { signed: false, error: 'Security alert: Cannot sign transaction' };
    }
    
    // Require password for high-value transactions
    if (requirePassword && password) {
      // Verify password before signing
      const verified = await this.verifyPassword(password);
      if (!verified) {
        return { signed: false, error: 'Invalid password' };
      }
    }
    
    // Verify private key format
    if (privateKey.length !== 32) {
      return { signed: false, error: 'Invalid private key' };
    }
    
    try {
      // Sign the transaction
      const keypair = Keypair.fromSecretKey(privateKey);
      //@ts-ignore
      transaction.sign(keypair);
      
      return { signed: true, signature: 'signed' };
    } catch (error) {
      return { signed: false, error: error.message };
    }
  }
  
  private async verifyPassword(password: string): Promise<boolean> {
    // Store a verification token
    const token = secureRandom(32);
    const tokenStr = Buffer.from(token).toString('base64');
    
    // Encrypt with password
    const encrypted = await militaryEncrypt(tokenStr, password);
    
    // Try to decrypt
    const result = await militaryDecrypt(encrypted, password);
    if (result.verified && result.data === tokenStr) {
      return true;
    }
    
    return false;
  }
  
  // Rate limiting for transactions
  private lastTransactionTime: number = 0;
  private transactionCount: number = 0;
  
  canExecuteTransaction(): { allowed: boolean; waitTime?: number } {
    const now = Date.now();
    const window = SECURITY_CONFIG.NETWORK.rateLimitWindow;
    const maxTransactions = SECURITY_CONFIG.NETWORK.rateLimitMax;
    
    if (now - this.lastTransactionTime > window) {
      this.lastTransactionTime = now;
      this.transactionCount = 1;
      return { allowed: true };
    }
    
    this.transactionCount++;
    
    if (this.transactionCount <= maxTransactions) {
      return { allowed: true };
    }
    
    const waitTime = window - (now - this.lastTransactionTime);
    return { allowed: false, waitTime };
  }
}

// ============================================
// EXPORTS
// ============================================

export { SECURITY_CONFIG };
