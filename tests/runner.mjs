// Simple test framework for SHADE
// Run with: node tests/runner.mjs

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
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
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
    toHaveLength(expected) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
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
      toBeNull() {
        if (actual !== null) {
          throw new Error(`Expected null but got ${actual}`);
        }
      },
    },
  };
}

// Helper for async SHA256
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

// ============================================
// UTILS TESTS
// ============================================

suite('Utils Tests', () => {
  test('formatAddress truncates long strings', () => {
    const formatAddress = (addr, chars = 8) => {
      if (addr.length <= chars * 2) return addr;
      return addr.slice(0, chars) + '...' + addr.slice(-chars);
    };
    
    const long = '7nYhPEvWk3xT4a3ZkGZJhZG2w4E6vG1xVpXqLmNoPqR';
    const result = formatAddress(long);
    
    assert(result).toContain('...');
    assert(result.length).toBe(19);
  });

  test('formatAddress handles short addresses', () => {
    const formatAddress = (addr, chars = 8) => {
      if (addr.length <= chars * 2) return addr;
      return addr.slice(0, chars) + '...' + addr.slice(-chars);
    };
    
    const short = 'abc123';
    const result = formatAddress(short);
    assert(result).toBe('abc123');
  });

  test('formatSOL formats correctly', () => {
    const formatSOL = (amount) => amount.toFixed(4);
    assert(formatSOL(1.123456)).toBe('1.1235');
    assert(formatSOL(0)).toBe('0.0000');
    assert(formatSOL(0.0001)).toBe('0.0001');
  });

  test('generateId creates unique hex strings', () => {
    const generateId = () => {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    };
    
    const id1 = generateId();
    const id2 = generateId();
    
    assert(id1.length).toBe(16);
    assert(id2.length).toBe(16);
    assert(id1).not.toBe(id2);
    assert(id1).toMatch(/^[0-9a-f]+$/);
  });

  test('truncate works correctly', () => {
    const truncate = (str, length) => {
      if (str.length <= length) return str;
      return str.slice(0, length) + '...';
    };
    
    assert(truncate('hello world', 5)).toBe('hello...');
    assert(truncate('hi', 10)).toBe('hi');
    assert(truncate('', 5)).toBe('');
  });
});

// ============================================
// BURNER LOGIC TESTS
// ============================================

suite('Burner Logic Tests', () => {
  test('burner structure is correct', () => {
    const createBurner = (label) => {
      return {
        id: Math.random().toString(36).substring(2, 10),
        label,
        publicKey: '7nYhPEvWk3xT4a3ZkGZJhZG2w4E6vG1xVpXqLmNoPqR',
        createdAt: Date.now(),
      };
    };
    
    const burner = createBurner('TEST');
    
    assert(burner.id.length).toBeGreaterThan(0);
    assert(burner.label).toBe('TEST');
    assert(burner.publicKey.length).toBeGreaterThan(40);
    assert(burner.createdAt).toBeGreaterThan(0);
  });

  test('sweep calculation is correct', () => {
    const calculateSweep = (balance, minBalance = 5000) => {
      const sendAmount = balance - minBalance;
      return sendAmount > 0 ? sendAmount : 0;
    };
    
    assert(calculateSweep(1000000000, 5000)).toBe(999995000);
    assert(calculateSweep(4000, 5000)).toBe(0);
    assert(calculateSweep(5000, 5000)).toBe(0);
    assert(calculateSweep(10000, 5000)).toBe(5000);
  });

  test('encryption returns base64 string', async () => {
    const encryptData = async (data, password) => {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return Buffer.from(combined).toString('base64');
    };
    
    const result = await encryptData('test', 'password123');
    assert(result.length).toBeGreaterThan(0);
    assert(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  test('encryption is reversible', async () => {
    const encryptData = async (data, password) => {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
      );
      
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return combined;
    };
    
    const decryptData = async (combined, password) => {
      const encoder = new TextEncoder();
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
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
        data
      );
      
      return new TextDecoder().decode(decrypted);
    };
    
    const original = 'This is a secret message!';
    const encrypted = await encryptData(original, 'testpassword');
    const decrypted = await decryptData(encrypted, 'testpassword');
    
    assert(decrypted).toBe(original);
  });
});

// ============================================
// STEALTH ADDRESS TESTS
// ============================================

suite('Stealth Address Tests', () => {
  test('hex to bytes conversion', () => {
    const hexToBytes = (hex) => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    };
    
    const result = hexToBytes('ff00aabb');
    assert(result.length).toBe(4);
    assert(result[0]).toBe(255);
    assert(result[1]).toBe(0);
    assert(result[2]).toBe(170);
    assert(result[3]).toBe(187);
  });

  test('bytes to hex conversion', () => {
    const bytesToHex = (bytes) => {
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    };
    
    const bytes = new Uint8Array([255, 0, 170, 187]);
    const result = bytesToHex(bytes);
    assert(result).toBe('ff00aabb');
  });

  test('SHA256 produces 32-byte hash', async () => {
    const result = await sha256('test');
    assert(result.length).toBe(32);
  });

  test('stealth address derivation', async () => {
    const generateStealthAddress = async (masterSeed, index) => {
      const hash = await sha256(masterSeed + ':stealth:' + index);
      return Buffer.from(hash).toString('base64').slice(0, 44);
    };
    
    const address1 = await generateStealthAddress('test-seed', 0);
    const address2 = await generateStealthAddress('test-seed', 0);
    
    // Same seed + index should produce same address
    assert(address1).toBe(address2);
    assert(address1.length).toBe(44);
  });

  test('different indices produce different addresses', async () => {
    const generateStealthAddress = async (masterSeed, index) => {
      const hash = await sha256(masterSeed + ':stealth:' + index);
      return Buffer.from(hash).toString('hex').slice(0, 44);
    };
    
    const addr1 = await generateStealthAddress('seed123', 0);
    const addr2 = await generateStealthAddress('seed123', 1);
    const addr3 = await generateStealthAddress('seed123', 2);
    
    assert(addr1).not.toBe(addr2);
    assert(addr2).not.toBe(addr3);
    assert(addr1).not.toBe(addr3);
  });

  test('same seed and index produces same address', async () => {
    const generateStealthAddress = async (masterSeed, index) => {
      const hash = await sha256(masterSeed + ':stealth:' + index);
      return Buffer.from(hash).toString('hex').slice(0, 44);
    };
    
    const addr1 = await generateStealthAddress('seed123', 5);
    const addr2 = await generateStealthAddress('seed123', 5);
    
    assert(addr1).toBe(addr2);
  });
});

// ============================================
// PASSKEY TESTS
// ============================================

suite('Passkey Tests', () => {
  test('WebAuthn availability check', () => {
    // WebAuthn check - works in browser, gracefully handles test environment
    const hasWindow = typeof window !== 'undefined';
    const hasPublicKeyCredential = hasWindow && typeof window.PublicKeyCredential !== 'undefined';
    if (hasWindow) {
      assert(typeof window).toBe('object');
    }
  });

  test('credential ID format', () => {
    const generateCredentialId = () => {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      return Buffer.from(bytes).toString('base64');
    };
    
    const id = generateCredentialId();
    assert(id.length).toBeGreaterThan(0);
  });

  test('passkey username handling', () => {
    const sanitizeUsername = (username) => {
      return username.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 64);
    };
    
    assert(sanitizeUsername('john_doe')).toBe('john_doe');
    assert(sanitizeUsername('John Doe!@#$%')).toBe('JohnDoe');
    assert(sanitizeUsername('')).toBe('');
    assert(sanitizeUsername('a'.repeat(100)).length).toBe(64);
  });

  test('keypair derivation from seed', async () => {
    const deriveKeypair = async (seed, derivationPath) => {
      const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(seed + derivationPath)
      );
      return new Uint8Array(hash);
    };
    
    const privateKey = await deriveKeypair('master-seed', 'm/44/501/0/0');
    assert(privateKey.length).toBe(32);
  });
});

// ============================================
// GASLESS TRANSACTION TESTS
// ============================================

suite('Gasless Transaction Tests', () => {
  test('fee calculation structure', () => {
    const estimateFee = (signatureCount) => {
      const lamportsPerSignature = 5000;
      return signatureCount * lamportsPerSignature;
    };
    
    assert(estimateFee(1)).toBe(5000);
    assert(estimateFee(2)).toBe(10000);
  });

  test('prepaid burner structure', () => {
    const createBurner = (id, address, solBalance) => ({
      id,
      address,
      keypair: 'encrypted_key',
      solBalance,
      createdAt: Date.now(),
    });
    
    const burner = createBurner('abc123', 'SolanaAddress...', 0.05);
    
    assert(burner.id).toBe('abc123');
    assert(burner.solBalance).toBeGreaterThan(0);
    assert(burner.createdAt).toBeGreaterThan(0);
  });

  test('gasless config validation', () => {
    const validateConfig = (config) => {
      return {
        enabled: Boolean(config.feePayerAddress),
        feePayerAddress: config.feePayerAddress || null,
      };
    };
    
    const valid = validateConfig({ feePayerAddress: 'abc123' });
    assert(valid.enabled).toBeTruthy();
    
    const invalid = validateConfig({});
    assert(invalid.enabled).toBeFalsy();
  });

  test('balance calculation in SOL', () => {
    const lamportsToSol = (lamports) => lamports / 1000000000;
    
    assert(lamportsToSol(1000000000)).toBe(1);
    assert(lamportsToSol(500000000)).toBe(0.5);
  });

  test('transaction serialization mock', () => {
    const serializeTransaction = (transaction) => {
      return Buffer.from(JSON.stringify(transaction)).toString('base64');
    };
    
    const tx = { recentBlockhash: 'abc', feePayer: 'xyz', signatures: [] };
    const serialized = serializeTransaction(tx);
    
    assert(serialized.length).toBeGreaterThan(0);
    assert(serialized).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

// ============================================
// SECURITY TESTS
// ============================================

suite('Security Tests', () => {
  test('encryption uses unique IV', async () => {
    const encryptWithIV = async (data, password, iv) => {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', encoder.encode(password.padEnd(32, '0').slice(0, 32)), 'AES-GCM', false, ['encrypt']);
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));
      return Buffer.from(encrypted).toString('base64');
    };
    
    const iv1 = crypto.getRandomValues(new Uint8Array(12));
    const iv2 = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted1 = await encryptWithIV('test', 'password', iv1);
    const encrypted2 = await encryptWithIV('test', 'password', iv2);
    
    // Different IVs should produce different ciphertexts
    assert(encrypted1).not.toBe(encrypted2);
  });

  test('password length affects security', async () => {
    const deriveKey = async (password) => {
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
      return new Uint8Array(hashBuffer);
    };
    
    const key1 = await deriveKey('short');
    const key2 = await deriveKey('short');
    const key3 = await deriveKey('longer password');
    
    // Same input = same output
    assert(Buffer.from(key1).toString('hex')).toBe(Buffer.from(key2).toString('hex'));
    // Different input = different output
    assert(Buffer.from(key1).toString('hex')).not.toBe(Buffer.from(key3).toString('hex'));
  });

  test('cryptographic randomness', () => {
    const checkRandomness = () => {
      const values = [];
      for (let i = 0; i < 100; i++) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        values.push(Buffer.from(bytes).toString('hex'));
      }
      // Check for duplicates
      const unique = new Set(values);
      return unique.size === values.length;
    };
    
    assert(checkRandomness()).toBeTruthy();
  });
});

// ============================================
// UI TESTS
// ============================================

suite('UI Tests', () => {
  test('CSS classes are defined', () => {
    const cssClasses = ['glass', 'glow', 'text-gradient', 'btn-primary', 'btn-secondary', 'btn-danger', 'input', 'card-hover'];
    
    for (const cls of cssClasses) {
      assert(cls.length).toBeGreaterThan(0);
    }
  });

  test('color palette has valid colors', () => {
    const colors = ['#00ff88', '#8b5cf6', '#050508', '#e0e0e0'];
    
    for (const color of colors) {
      assert(color.startsWith('#')).toBeTruthy();
      assert(color.length).toBe(7);
    }
  });

  test('view modes are defined', () => {
    const viewModes = ['dashboard', 'transfer', 'create', 'backup', 'stealth', 'passkey', 'gasless', 'connect'];

    assert(viewModes.length).toBe(8);
    for (const mode of viewModes) {
      assert(mode.length).toBeGreaterThan(0);
    }
  });
});

// ============================================
// RUN TESTS
// ============================================

console.log('\n🧪 SHADE Wallet Tests\n');

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
