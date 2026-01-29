// IndexedDBStorage - Secure storage implementation using IndexedDB
// All data is encrypted before storage using SecureKeyManager

import {
  StorageProvider,
  StorageRecord,
  SecureStorageOptions,
  DEFAULT_STORAGE_OPTIONS,
} from './StorageProvider';
import { secureKeyManager, EncryptedData } from './SecureKeyManager';

interface DBRecord {
  key: string;
  data: EncryptedData;
  createdAt: number;
  updatedAt: number;
}

export class IndexedDBStorage implements StorageProvider {
  private db: IDBDatabase | null = null;
  private options: Required<SecureStorageOptions>;
  private ready = false;

  constructor(options: SecureStorageOptions = {}) {
    this.options = { ...DEFAULT_STORAGE_OPTIONS, ...options } as Required<SecureStorageOptions>;
  }

  async initialize(): Promise<boolean> {
    if (typeof indexedDB === 'undefined') {
      console.error('IndexedDB not available');
      return false;
    }

    return new Promise((resolve) => {
      const request = indexedDB.open(this.options.dbName, this.options.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.ready = true;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.options.storeName)) {
          const store = db.createObjectStore(this.options.storeName, {
            keyPath: 'key',
          });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  isReady(): boolean {
    return this.ready && this.db !== null && secureKeyManager.isActive();
  }

  private ensureReady(): void {
    if (!this.db) {
      throw new Error('IndexedDBStorage not initialized');
    }
    if (!secureKeyManager.isActive()) {
      throw new Error('SecureKeyManager not unlocked');
    }
  }

  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    this.ensureReady();
    const transaction = this.db!.transaction(this.options.storeName, mode);
    return transaction.objectStore(this.options.storeName);
  }

  async get(key: string): Promise<string | null> {
    this.ensureReady();

    return new Promise((resolve) => {
      const store = this.getStore('readonly');
      const request = store.get(key);

      request.onerror = () => {
        console.error('Failed to get from IndexedDB:', request.error);
        resolve(null);
      };

      request.onsuccess = async () => {
        const record = request.result as DBRecord | undefined;
        if (!record) {
          resolve(null);
          return;
        }

        try {
          const decrypted = await secureKeyManager.decrypt(record.data, key);
          resolve(decrypted);
        } catch (error) {
          console.error('Failed to decrypt:', error);
          resolve(null);
        }
      };
    });
  }

  async set(key: string, value: string): Promise<boolean> {
    this.ensureReady();

    try {
      const encrypted = await secureKeyManager.encrypt(value, key);
      const now = Date.now();

      return new Promise((resolve) => {
        const store = this.getStore('readwrite');

        // Check if key exists for createdAt preservation
        const getRequest = store.get(key);

        getRequest.onsuccess = () => {
          const existing = getRequest.result as DBRecord | undefined;
          const record: DBRecord = {
            key,
            data: encrypted,
            createdAt: existing?.createdAt || now,
            updatedAt: now,
          };

          const putRequest = store.put(record);

          putRequest.onerror = () => {
            console.error('Failed to set in IndexedDB:', putRequest.error);
            resolve(false);
          };

          putRequest.onsuccess = () => {
            resolve(true);
          };
        };

        getRequest.onerror = () => {
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Failed to encrypt:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    this.ensureReady();

    return new Promise((resolve) => {
      const store = this.getStore('readwrite');
      const request = store.delete(key);

      request.onerror = () => {
        console.error('Failed to delete from IndexedDB:', request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        resolve(true);
      };
    });
  }

  async has(key: string): Promise<boolean> {
    this.ensureReady();

    return new Promise((resolve) => {
      const store = this.getStore('readonly');
      const request = store.count(IDBKeyRange.only(key));

      request.onerror = () => {
        resolve(false);
      };

      request.onsuccess = () => {
        resolve(request.result > 0);
      };
    });
  }

  async getMultiple(keys: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get(key);
        results.set(key, value);
      })
    );

    return results;
  }

  async setMultiple(
    entries: Array<{ key: string; value: string }>
  ): Promise<boolean> {
    try {
      await Promise.all(
        entries.map(({ key, value }) => this.set(key, value))
      );
      return true;
    } catch {
      return false;
    }
  }

  async deleteMultiple(keys: string[]): Promise<boolean> {
    try {
      await Promise.all(keys.map((key) => this.delete(key)));
      return true;
    } catch {
      return false;
    }
  }

  async keys(prefix?: string): Promise<string[]> {
    this.ensureReady();

    return new Promise((resolve) => {
      const store = this.getStore('readonly');
      const request = store.getAllKeys();

      request.onerror = () => {
        console.error('Failed to get keys from IndexedDB:', request.error);
        resolve([]);
      };

      request.onsuccess = () => {
        let keys = request.result as string[];
        if (prefix) {
          keys = keys.filter((key) => key.startsWith(prefix));
        }
        resolve(keys);
      };
    });
  }

  async clear(prefix?: string): Promise<boolean> {
    this.ensureReady();

    if (!prefix) {
      return new Promise((resolve) => {
        const store = this.getStore('readwrite');
        const request = store.clear();

        request.onerror = () => {
          resolve(false);
        };

        request.onsuccess = () => {
          resolve(true);
        };
      });
    }

    // Clear only keys with prefix
    const keysToDelete = await this.keys(prefix);
    return this.deleteMultiple(keysToDelete);
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.ready = false;
    }
  }

  // Get raw encrypted record (for migration)
  async getRaw(key: string): Promise<DBRecord | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const store = this.getStore('readonly');
      const request = store.get(key);

      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  // Set raw encrypted record (for migration)
  async setRaw(record: DBRecord): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const store = this.getStore('readwrite');
      const request = store.put(record);

      request.onerror = () => resolve(false);
      request.onsuccess = () => resolve(true);
    });
  }
}
