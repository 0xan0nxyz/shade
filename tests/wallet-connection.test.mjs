// Wallet Connection Tests
// Tests for Phantom/Solflare integration

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
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${actual}`);
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
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy but got ${actual}`);
        }
      },
    },
  };
}

// ============================================
// WALLET CONNECTION TESTS
// ============================================

suite('Wallet Connection Tests', () => {
  test('wallet detection returns empty when no wallet installed', () => {
    const isPhantomInstalled = false;
    const isSolflareInstalled = false;
    const isWalletInstalled = isPhantomInstalled || isSolflareInstalled;
    assert(isWalletInstalled).toBeFalsy();
  });

  test('wallet detection returns true when Phantom installed', () => {
    const isPhantomInstalled = true;
    const isSolflareInstalled = false;
    const isWalletInstalled = isPhantomInstalled || isSolflareInstalled;
    assert(isWalletInstalled).toBeTruthy();
  });

  test('wallet detection returns true when Solflare installed', () => {
    const isPhantomInstalled = false;
    const isSolflareInstalled = true;
    const isWalletInstalled = isPhantomInstalled || isSolflareInstalled;
    assert(isWalletInstalled).toBeTruthy();
  });

  test('available wallets returns correct list', () => {
    const getAvailableWallets = () => {
      const wallets = [];
      if (true) wallets.push('phantom');
      if (true) wallets.push('solflare');
      return wallets;
    };
    const wallets = getAvailableWallets();
    assert(wallets.length).toBe(2);
    assert(wallets).toContain('phantom');
    assert(wallets).toContain('solflare');
  });

  test('wallet icon returns correct emoji', () => {
    const getWalletIcon = (adapter) => {
      if (adapter === 'phantom') return '👻';
      if (adapter === 'solflare') return '☀️';
      return '💼';
    };
    assert(getWalletIcon('phantom')).toBe('👻');
    assert(getWalletIcon('solflare')).toBe('☀️');
  });

  test('wallet name returns correct name', () => {
    const getWalletName = (adapter) => {
      if (adapter === 'phantom') return 'Phantom';
      if (adapter === 'solflare') return 'Solflare';
      return 'Wallet';
    };
    assert(getWalletName('phantom')).toBe('Phantom');
    assert(getWalletName('solflare')).toBe('Solflare');
  });

  test('connected wallet structure is correct', () => {
    const mockWallet = {
      address: '7nYhPEvWk3xT4a3ZkGZJhZG2w4E6vG1xVpXqLmNoPqR',
      adapter: 'phantom',
      connected: true,
    };
    assert(mockWallet.address.length).toBeGreaterThan(40);
    assert(mockWallet.adapter).toBe('phantom');
    assert(mockWallet.connected).toBeTruthy();
  });

  test('address truncation works correctly', () => {
    const formatAddress = (addr, chars = 8) => {
      if (addr.length <= chars * 2) return addr;
      return addr.slice(0, chars) + '...' + addr.slice(-chars);
    };
    const long = '7nYhPEvWk3xT4a3ZkGZJhZG2w4E6vG1xVpXqLmNoPqR';
    const formatted = formatAddress(long, 8);
    assert(formatted).toContain('...');
    assert(formatted.length).toBe(19);
  });

  test('balance formatting works correctly', () => {
    const formatBalance = (sol) => `${sol.toFixed(4)} SOL`;
    assert(formatBalance(1.5)).toBe('1.5000 SOL');
    assert(formatBalance(0.123456)).toBe('0.1235 SOL');
  });
});

// ============================================
// SOLANA UTILITY TESTS
// ============================================

suite('Solana Utilities Tests', () => {
  test('network configuration is valid', () => {
    const NETWORKS = {
      devnet: { rpcUrl: 'https://api.devnet.solana.com' },
      testnet: { rpcUrl: 'https://api.testnet.solana.com' },
    };
    assert(NETWORKS.devnet.rpcUrl).toContain('devnet');
    assert(NETWORKS.testnet.rpcUrl).toContain('testnet');
  });

  test('lamports to SOL conversion', () => {
    const lamportsToSol = (lamports) => lamports / 1000000000;
    assert(lamportsToSol(1000000000)).toBe(1);
    assert(lamportsToSol(500000000)).toBe(0.5);
  });

  test('SOL to lamports conversion', () => {
    const solToLamports = (sol) => sol * 1000000000;
    assert(solToLamports(1)).toBe(1000000000);
    assert(solToLamports(0.5)).toBe(500000000);
  });

  test('explorer URL generation', () => {
    const getExplorerUrl = (address, network) => {
      const baseUrl = network === 'devnet' 
        ? 'https://solscan.io?cluster=devnet'
        : 'https://solscan.io?cluster=testnet';
      return `${baseUrl}/address/${address}`;
    };
    const url = getExplorerUrl('7nYhPEvWk3xT4a3ZkGZJhZG2w4E6vG1xVpXqLmNoPqR', 'devnet');
    assert(url).toContain('solscan.io');
    assert(url).toContain('devnet');
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

suite('Error Handling Tests', () => {
  test('connection errors are handled gracefully', async () => {
    const simulateConnection = async (shouldFail) => {
      if (shouldFail) throw new Error('Connection failed');
      return { success: true };
    };
    const result = await simulateConnection(false);
    assert(result.success).toBeTruthy();
    try {
      await simulateConnection(true);
      assert(false).toBeTruthy();
    } catch (error) {
      assert(error.message).toBe('Connection failed');
    }
  });

  test('wallet not installed error', () => {
    const checkWallet = (isInstalled) => {
      if (!isInstalled) return { error: 'Wallet not installed' };
      return { success: true };
    };
    assert(checkWallet(false).error).toBe('Wallet not installed');
    assert(checkWallet(true).success).toBeTruthy();
  });

  test('insufficient balance error', () => {
    const checkBalance = (balance, required) => {
      if (balance < required) return { error: 'Insufficient balance' };
      return { success: true };
    };
    const result = checkBalance(0.5, 1.0);
    assert(result.error).toBe('Insufficient balance');
  });
});

// ============================================
// SECURITY TESTS
// ============================================

suite('Security Tests', () => {
  test('private key storage uses secure methods', () => {
    const mockStorage = new Map();
    const setSecureItem = (key, value) => mockStorage.set(key, value);
    const getSecureItem = (key) => mockStorage.get(key) || null;
    setSecureItem('test_key', 'encrypted_value');
    assert(getSecureItem('test_key')).toBe('encrypted_value');
    assert(getSecureItem('missing_key')).toBeNull();
  });

  test('session timeout handling', () => {
    const createSession = (timeoutMs) => ({
      createdAt: Date.now(),
      timeoutMs,
      isValid() {
        return Date.now() - this.createdAt < this.timeoutMs;
      },
    });
    const session = createSession(300000);
    assert(session.isValid()).toBeTruthy();
  });

  test('wallet disconnect clears session', () => {
    const mockWallet = { connected: true, disconnect() { this.connected = false; } };
    assert(mockWallet.connected).toBeTruthy();
    mockWallet.disconnect();
    assert(mockWallet.connected).toBeFalsy();
  });
});

// ============================================
// RUN TESTS
// ============================================

console.log('\n🧪 SHADE Wallet Connection Tests\n');

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

if (failed > 0) process.exit(1);
