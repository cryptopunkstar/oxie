import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, Eip1193Provider } from 'ethers';
import { EIP6963ProviderDetail, EIP6963AnnounceProviderEvent } from '../types';
import { SEI_CHAIN_ID_HEX, SEI_CHAIN_PARAMS } from '../services/blockchain';

interface UseWalletReturn {
  account: string | null;
  provider: BrowserProvider | null;
  detectedWallets: EIP6963ProviderDetail[];
  connectWallet: (walletDetail?: EIP6963ProviderDetail) => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
  isConnecting: boolean;
}

export const useWallet = (): UseWalletReturn => {
  const [detectedWallets, setDetectedWallets] = useState<EIP6963ProviderDetail[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // EIP-6963: Listen for provider announcements
  useEffect(() => {
    const handleNewProvider = (event: EIP6963AnnounceProviderEvent) => {
      setDetectedWallets((prev) => {
        // Avoid duplicates
        if (prev.some((w) => w.info.uuid === event.detail.info.uuid)) return prev;
        return [...prev, event.detail];
      });
    };

    window.addEventListener("eip6963:announceProvider", handleNewProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleNewProvider);
    };
  }, []);

  const switchNetwork = async (provider: BrowserProvider) => {
    try {
        const network = await provider.getNetwork();
        if (network.chainId !== BigInt(parseInt(SEI_CHAIN_ID_HEX, 16))) {
            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: SEI_CHAIN_ID_HEX }]);
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902 || switchError.error?.code === 4902) {
                    await provider.send("wallet_addEthereumChain", [SEI_CHAIN_PARAMS]);
                } else {
                    throw switchError;
                }
            }
        }
    } catch (err: any) {
        console.error("Failed to switch network:", err);
        throw new Error("Failed to switch to Sei Network. Please do it manually.");
    }
  };

  const connectWallet = useCallback(async (walletDetail?: EIP6963ProviderDetail) => {
    setIsConnecting(true);
    setError(null);
    try {
      let rawProvider: Eip1193Provider | undefined;

      if (walletDetail) {
        rawProvider = walletDetail.provider;
      } else if (window.ethereum) {
        rawProvider = window.ethereum;
      } else {
        throw new Error("No Ethereum wallet found. Please install Rabby or MetaMask.");
      }

      const browserProvider = new BrowserProvider(rawProvider);
      await browserProvider.send("eth_requestAccounts", []);
      
      await switchNetwork(browserProvider);

      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setProvider(browserProvider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setError(null);
  }, []);

  return {
    account,
    provider,
    detectedWallets,
    connectWallet,
    disconnectWallet,
    error,
    isConnecting
  };
};