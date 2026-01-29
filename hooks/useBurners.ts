'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  BurnerWallet,
  BurnerWithBalance,
  createBurner as createBurnerLib,
  getBurnerBalance,
  destroyBurner as destroyBurnerLib,
  sweepBurner as sweepBurnerLib,
  getStoredBurnersSync,
} from '@/lib/burner';

export function useBurners() {
  const [burners, setBurners] = useState<BurnerWithBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBurners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = getStoredBurnersSync();

      const withBalances: BurnerWithBalance[] = await Promise.all(
        stored.map(async (b) => ({
          ...b,
          balance: await getBurnerBalance(b.publicKey),
        }))
      );

      setBurners(withBalances);
    } catch (err) {
      console.error('Failed to load burners:', err);
      setError('Failed to load burners');
    }
    setLoading(false);
  }, []);

  const createBurner = useCallback(async (label?: string) => {
    setLoading(true);
    setError(null);
    try {
      const newBurner = await createBurnerLib(label);
      await loadBurners();
      return newBurner;
    } catch (err) {
      console.error('Failed to create burner:', err);
      setError('Failed to create burner');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBurners]);

  const destroyBurner = useCallback(async (id: string) => {
    setError(null);
    try {
      await destroyBurnerLib(id);
      await loadBurners();
    } catch (err) {
      console.error('Failed to destroy burner:', err);
      setError('Failed to destroy burner');
      throw err;
    }
  }, [loadBurners]);

  const sweepBurner = useCallback(async (burnerId: string, destinationAddress: string) => {
    setError(null);
    try {
      const signature = await sweepBurnerLib(burnerId, destinationAddress);
      await loadBurners();
      return signature;
    } catch (err) {
      console.error('Failed to sweep burner:', err);
      setError('Failed to sweep burner');
      throw err;
    }
  }, [loadBurners]);

  const totalBalance = burners.reduce((sum, b) => sum + b.balance, 0);

  // Load on mount
  useEffect(() => {
    loadBurners();
  }, [loadBurners]);

  return {
    burners,
    loading,
    error,
    totalBalance,
    loadBurners,
    createBurner,
    destroyBurner,
    sweepBurner,
  };
}
