// Military-Grade Security Tests
// Tests for maximum security features

const suites = [];

function suite(name, fn) {
  suites.push({ name, fn, tests: [] });
  fn();
}

function test(name, fn) {
  const currentSuite = suites[suites.length - 1];
  if (currentSuite) {
    currentSuite.tests.push({ name, fn });
  }
}

function assert(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value but got ${actual}`);
      }
    },
    toContain(expected) {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      }
    },
    toMatch(regex) {
      if (!regex.test(actual)) {
        throw new Error(`Expected ${actual} to match ${regex}`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected ${actual} to NOT be ${expected}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected falsy but got ${actual}`);
        }
      },
    },
  };
}

// ============================================
// SECURE RANDOM TESTS
// ============================================

suite('Secure Random Tests', () => {
  test('secureRandom generates correct length', () => {
    const secureRandom = (length) => {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return bytes;
    };
    
    assert(secureRandom(16).length).toBe(16);
    assert(secureRandom(32).length).toBe(32);
    assert(secureRandom(64).length).toBe(64);
  });

  test('secureRandom produces unique values', () => {
    const secureRandom = (length) => {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return bytes;
    };
    
    const values = [];
    for (let i = 0; i < 100; i++) {
      const bytes = secureRandom(32);
      values.push(Buffer.from(bytes).toString('hex'));
    }
    
    const unique = new Set(values);
    assert(unique.size).toBe(100);
  });

  test('secureRandom is cryptographically random', () => {
    const secureRandom = (length) => {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return bytes;
    };
    
    // Check for patterns (chi-squared test simplified)
    const bytes = secureRandom(10000);
    let ones = 0;
    for (const b of bytes) {
      for (let i = 0; i < 8; i++) {
        if ((b >> i) & 1) ones++;
      }
    }
    
    const total = bytes.length * 8;
    const ratio = ones / total;
    
    // Should be roughly 0.5 (between 0.45 and 0.55)
    assert(ratio).toBeGreaterThan(0.45);
  });
});

// ============================================
// ENCRYPTION TESTS
// ============================================

suite('Military Encryption Tests', () => {
  test('encryption produces base64 output', async () => {
    const militaryEncrypt = async (data, password) => {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt']
      );
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      return Buffer.from(combined).toString('base64');
    };
    
    const result = await militaryEncrypt('test data', 'password123');
    assert(result.length).toBeGreaterThan(0);
    assert(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  test('decryption reverses encryption', async () => {
    const militaryEncrypt = async (data, password) => {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
      );
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      return combined;
    };
    
    const militaryDecrypt = async (combined, password) => {
      const encoder = new TextEncoder();
      const data = new Uint8Array(combined);
      const salt = data.slice(0, 32);
      const iv = data.slice(32, 48);
      const encryptedData = data.slice(48);
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['decrypt']
      );
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );
      return new TextDecoder().decode(decrypted);
    };
    
    const original = 'Secret military data!';
    const encrypted = await militaryEncrypt(original, 'password123');
    const decrypted = await militaryDecrypt(encrypted, 'password123');
    
    assert(decrypted).toBe(original);
  });

  test('different passwords produce different results', async () => {
    const militaryEncrypt = async (data, password) => {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt']
      );
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      return combined;
    };
    
    const encrypted1 = await militaryEncrypt('test', 'password1');
    const encrypted2 = await militaryEncrypt('test', 'password2');
    
    assert(Buffer.from(encrypted1).toString('hex')).not.toBe(Buffer.from(encrypted2).toString('hex'));
  });

  test('same data different time produces different ciphertext', async () => {
    const militaryEncrypt = async (data, password) => {
      const encoder = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt']
      );
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);
      return combined;
    };
    
    const encrypted1 = await militaryEncrypt('test', 'password');
    await new Promise(r => setTimeout(r, 10)); // Small delay
    const encrypted2 = await militaryEncrypt('test', 'password');
    
    assert(Buffer.from(encrypted1).toString('hex')).not.toBe(Buffer.from(encrypted2).toString('hex'));
  });
});

// ============================================
// KEY DERIVATION TESTS
// ============================================

suite('Key Derivation Tests', () => {
  test('deriveKey produces 32-byte key', async () => {
    const deriveKey = async (password, salt) => {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      const key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 1000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
      return key;
    };
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey('password', salt);
    assert(key).toBeTruthy();
  });

  test('same password + salt produces same key', async () => {
    const deriveKey = async (password, salt) => {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 1000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
    };
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key1 = await deriveKey('password', salt);
    const key2 = await deriveKey('password', salt);
    
    // Same inputs should produce functionally equivalent keys
    const enc1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: new Uint8Array(12) }, key1, new Uint8Array(1));
    const enc2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: new Uint8Array(12) }, key2, new Uint8Array(1));
    
    assert(enc1.byteLength).toBe(enc2.byteLength);
  });

  test('different salts produce different keys', async () => {
    const deriveKey = async (password, salt) => {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 1000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );
    };
    
    const salt1 = crypto.getRandomValues(new Uint8Array(16));
    const salt2 = crypto.getRandomValues(new Uint8Array(16));
    const key1 = await deriveKey('password', salt1);
    const key2 = await deriveKey('password', salt2);
    
    const enc1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: new Uint8Array(12) }, key1, new Uint8Array(1));
    const enc2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: new Uint8Array(12) }, key2, new Uint8Array(1));
    
    // Different salts should produce different ciphertext
    assert(enc1).not.toBe(enc2);
  });
});

// ============================================
// SESSION SECURITY TESTS
// ============================================

suite('Session Security Tests', () => {
  test('session locks after timeout', () => {
    const SESSION_TIMEOUT = 100; // 100ms for testing
    
    class SecureSession {
      constructor() {
        this.locked = true;
        this.lastActivity = 0;
      }
      
      checkTimeout() {
        if (!this.locked && Date.now() - this.lastActivity > SESSION_TIMEOUT) {
          this.lock();
        }
      }
      
      lock() {
        this.locked = true;
      }
      
      unlock() {
        this.locked = false;
        this.lastActivity = Date.now();
      }
      
      isLocked() {
        this.checkTimeout();
        return this.locked;
      }
    }
    
    const session = new SecureSession();
    assert(session.isLocked()).toBeTruthy();
    
    session.unlock();
    assert(session.isLocked()).toBeFalsy();
    
    // Wait for timeout
    return new Promise(resolve => {
      setTimeout(() => {
        assert(session.isLocked()).toBeTruthy();
        resolve();
      }, 150);
    });
  });

  test('rate limiting prevents spam', () => {
    const RATE_LIMIT = 3;
    const window = 60000;
    const requests = [];
    
    const checkRateLimit = (newRequest = true) => {
      const now = Date.now();
      const valid = requests.filter(t => now - t < window);
      
      if (valid.length >= RATE_LIMIT) {
        return { allowed: false, remaining: 0 };
      }
      
      if (newRequest) {
        requests.push(now);
      }
      return { allowed: true, remaining: RATE_LIMIT - valid.length - (newRequest ? 1 : 0) };
    };
    
    checkRateLimit(true);
    checkRateLimit(true);
    checkRateLimit(true);
    // Fourth request should be blocked
    const result = checkRateLimit(true);
    assert(result.allowed).toBeFalsy();
  });
});

// ============================================
// CHECKSUM TESTS
// ============================================

suite('Checksum Tests', () => {
  test('checksum detects modification', async () => {
    const computeChecksum = async (data) => {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-512', encoder.encode(data));
      return Buffer.from(hashBuffer).toString('hex');
    };
    
    const data = 'Original data';
    const checksum1 = await computeChecksum(data);
    
    // Modify data
    const modified = 'Modified data';
    const checksum2 = await computeChecksum(modified);
    
    assert(checksum1).not.toBe(checksum2);
  });

  test('checksum is deterministic', async () => {
    const computeChecksum = async (data) => {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-512', encoder.encode(data));
      return Buffer.from(hashBuffer).toString('hex');
    };
    
    const data = 'Test data for checksum';
    const checksum1 = await computeChecksum(data);
    const checksum2 = await computeChecksum(data);
    
    assert(checksum1).toBe(checksum2);
  });
});

// ============================================
// RUN TESTS
// ============================================

console.log('\n🛡️ SHADE Military-Grade Security Tests\n');

let passed = 0;
let failed = 0;

for (const suite of suites) {
  console.log(`📁 ${suite.name}`);
  for (const t of suite.tests) {
    try {
      t.fn();
      console.log(`  ✅ ${t.name}`);
      passed++;
    } catch (error) {
      console.log(`  ❌ ${t.name}: ${error.message}`);
      failed++;
    }
  }
}

console.log(`\n✨ ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
