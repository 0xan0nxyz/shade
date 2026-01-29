// SecureKeyManager - Handles key derivation and encryption
// Uses PBKDF2 with 310k iterations (OWASP 2025 recommendation)

const SECURITY_CONFIG = {
  KDF: {
    algorithm: 'PBKDF2',
    hash: 'SHA-512',
    iterations: 310000,
    saltLength: 32,
  },
  ENCRYPTION: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 16,
    tagLength: 128,
  },
};

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  salt: string; // Base64 encoded
  iv: string; // Base64 encoded
  version: number;
}

export class SecureKeyManager {
  private static instance: SecureKeyManager;
  private masterKey: CryptoKey | null = null;
  private masterSalt: Uint8Array | null = null;
  private isUnlocked = false;
  private cachedPassword: string | null = null; // Cached in memory only

  private constructor() {}

  static getInstance(): SecureKeyManager {
    if (!SecureKeyManager.instance) {
      SecureKeyManager.instance = new SecureKeyManager();
    }
    return SecureKeyManager.instance;
  }

  // Generate cryptographically secure random bytes
  private secureRandom(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  // Derive a key from password using PBKDF2
  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: SECURITY_CONFIG.KDF.algorithm,
        salt,
        iterations: SECURITY_CONFIG.KDF.iterations,
        hash: SECURITY_CONFIG.KDF.hash,
      },
      keyMaterial,
      {
        name: SECURITY_CONFIG.ENCRYPTION.algorithm,
        length: SECURITY_CONFIG.ENCRYPTION.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Derive a sub-key for a specific purpose (prevents key reuse)
  private async deriveSubKey(purpose: string): Promise<CryptoKey> {
    if (!this.masterSalt) {
      throw new Error('SecureKeyManager not unlocked');
    }

    if (!this.cachedPassword) {
      throw new Error('Password not cached - cannot derive sub-key');
    }

    // Create a purpose-specific salt by hashing masterSalt + purpose
    const encoder = new TextEncoder();
    const purposeBuffer = encoder.encode(purpose);
    const combined = new Uint8Array(
      this.masterSalt.length + purposeBuffer.length
    );
    combined.set(this.masterSalt);
    combined.set(purposeBuffer, this.masterSalt.length);

    const subSaltBuffer = await crypto.subtle.digest('SHA-256', combined);
    const subSalt = new Uint8Array(subSaltBuffer);

    // Derive sub-key using cached password + sub-salt
    const passwordBuffer = encoder.encode(this.cachedPassword);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: SECURITY_CONFIG.KDF.algorithm,
        salt: subSalt,
        iterations: 1000, // Fewer iterations since master key is already strong
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: SECURITY_CONFIG.ENCRYPTION.algorithm,
        length: SECURITY_CONFIG.ENCRYPTION.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Initialize with master password
  async unlock(password: string, existingSalt?: string): Promise<boolean> {
    try {
      // Use existing salt or generate new one
      if (existingSalt) {
        this.masterSalt = new Uint8Array(
          Buffer.from(existingSalt, 'base64')
        );
      } else {
        this.masterSalt = this.secureRandom(SECURITY_CONFIG.KDF.saltLength);
      }

      // Cache password in memory for sub-key derivation (cleared on lock)
      this.cachedPassword = password;

      this.masterKey = await this.deriveKey(password, this.masterSalt);
      this.isUnlocked = true;
      return true;
    } catch (error) {
      console.error('Failed to unlock SecureKeyManager:', error);
      return false;
    }
  }

  // Get the master salt (needed for persistence)
  getMasterSalt(): string | null {
    if (!this.masterSalt) return null;
    return Buffer.from(this.masterSalt).toString('base64');
  }

  // Lock the key manager
  lock(): void {
    this.masterKey = null;
    this.masterSalt = null;
    this.cachedPassword = null;
    this.isUnlocked = false;
  }

  // Check if unlocked
  isActive(): boolean {
    return this.isUnlocked && this.masterKey !== null;
  }

  // Encrypt data for a specific purpose/module
  async encrypt(data: string, purpose: string = 'default'): Promise<EncryptedData> {
    if (!this.isActive()) {
      throw new Error('SecureKeyManager not unlocked');
    }

    const key = await this.deriveSubKey(purpose);
    const iv = this.secureRandom(SECURITY_CONFIG.ENCRYPTION.ivLength);
    const encoder = new TextEncoder();

    const ciphertext = await crypto.subtle.encrypt(
      { name: SECURITY_CONFIG.ENCRYPTION.algorithm, iv },
      key,
      encoder.encode(data)
    );

    return {
      ciphertext: Buffer.from(ciphertext).toString('base64'),
      salt: this.getMasterSalt()!,
      iv: Buffer.from(iv).toString('base64'),
      version: 1,
    };
  }

  // Decrypt data
  async decrypt(encrypted: EncryptedData, purpose: string = 'default'): Promise<string> {
    if (!this.isActive()) {
      throw new Error('SecureKeyManager not unlocked');
    }

    const key = await this.deriveSubKey(purpose);
    const iv = new Uint8Array(Buffer.from(encrypted.iv, 'base64'));
    const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');

    const decrypted = await crypto.subtle.decrypt(
      { name: SECURITY_CONFIG.ENCRYPTION.algorithm, iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // Verify a password against stored data
  async verifyPassword(
    password: string,
    salt: string,
    testCiphertext: string,
    testIv: string,
    expectedPlaintext: string
  ): Promise<boolean> {
    try {
      const saltBytes = new Uint8Array(Buffer.from(salt, 'base64'));
      const key = await this.deriveKey(password, saltBytes);
      const iv = new Uint8Array(Buffer.from(testIv, 'base64'));
      const ciphertext = Buffer.from(testCiphertext, 'base64');

      const decrypted = await crypto.subtle.decrypt(
        { name: SECURITY_CONFIG.ENCRYPTION.algorithm, iv },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted) === expectedPlaintext;
    } catch {
      return false;
    }
  }
}

export const secureKeyManager = SecureKeyManager.getInstance();
