'use client';

import { useState, useCallback, useEffect } from 'react';
import { getNetwork, setNetwork as setNetworkLib, requestAirdrop, getExplorerUrl } from '@/lib/solana';
import { Network, NETWORKS } from '@/lib/constants';

export function useNetwork() {
  const [network, setNetworkState] = useState<Network>('devnet');
  const [airdropStatus, setAirdropStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedNetwork = getNetwork();
    setNetworkState(savedNetwork);
  }, []);

  const setNetwork = useCallback((newNetwork: Network) => {
    setNetworkLib(newNetwork);
    setNetworkState(newNetwork);
  }, []);

  const handleRequestAirdrop = useCallback(async (address: string) => {
    // Airdrop only available on devnet
    if (network !== 'devnet') {
      const message = network === 'mainnet'
        ? 'Airdrop not available on mainnet (real SOL)'
        : 'Airdrop only available on devnet';
      setAirdropStatus(message);
      setTimeout(() => setAirdropStatus(null), 3000);
      return;
    }

    setLoading(true);
    setAirdropStatus('Requesting airdrop...');

    try {
      const success = await requestAirdrop(address);
      if (success) {
        setAirdropStatus('Airdrop successful! +2 SOL');
      } else {
        setAirdropStatus('Airdrop failed. Please try again.');
      }
    } catch {
      setAirdropStatus('Airdrop failed. Please try again.');
    }

    setLoading(false);

    // Clear status after 3 seconds
    setTimeout(() => setAirdropStatus(null), 3000);
  }, [network]);

  const networkColors: Record<Network, string> = {
    mainnet: 'from-red-500 to-rose-500',
    devnet: 'from-green-500 to-emerald-500',
    testnet: 'from-yellow-500 to-orange-500',
  };

  const networkNames: Record<Network, string> = {
    mainnet: 'Mainnet',
    devnet: 'Devnet',
    testnet: 'Testnet',
  };

  // Check if current network is mainnet (for warnings)
  const isMainnet = NETWORKS[network].isMainnet;

  return {
    network,
    setNetwork,
    airdropStatus,
    loading,
    handleRequestAirdrop,
    getExplorerUrl,
    networkColors: networkColors[network],
    networkName: networkNames[network],
    isMainnet,
  };
}
