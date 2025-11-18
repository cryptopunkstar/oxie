import React, { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Wallet, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { CONTRACT_ADDRESS, CONTRACT_ABI, formatAddress } from './services/blockchain';
import { useWallet } from './hooks/useWallet';
import { WalletModal } from './components/WalletModal';
import { ContractStatus } from './types';

const App: React.FC = () => {
  const { account, provider, detectedWallets, connectWallet, disconnectWallet, error, isConnecting } = useWallet();
  const [mintCount, setMintCount] = useState<string>('0');
  const [status, setStatus] = useState<ContractStatus>(ContractStatus.IDLE);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch supply
  const fetchSupply = useCallback(async () => {
    if (!provider) return;
    try {
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const supply = await contract.totalSupply();
      setMintCount(supply.toString());
    } catch (err) {
      console.error("Error fetching supply:", err);
    }
  }, [provider]);

  useEffect(() => {
    if (provider) {
      fetchSupply();
      const interval = setInterval(fetchSupply, 15000);
      return () => clearInterval(interval);
    }
  }, [provider, fetchSupply]);

  const handleMint = async () => {
    if (!provider || !account) return;

    setStatus(ContractStatus.MINTING);
    setStatusMessage("Minting your NFT...");

    try {
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.mint({ gasLimit: 300000 });
      
      setStatusMessage("Transaction submitted! Waiting for confirmation...");
      await tx.wait();

      setStatus(ContractStatus.SUCCESS);
      setStatusMessage("NFT minted successfully! 🎉");
      fetchSupply();

      // Reset success message after 5s
      setTimeout(() => {
        setStatus(ContractStatus.IDLE);
        setStatusMessage("");
      }, 5000);

    } catch (err: any) {
      console.error("Mint error:", err);
      setStatus(ContractStatus.ERROR);
      if (err.code === "ACTION_REJECTED") {
        setStatusMessage("Transaction rejected by user.");
      } else {
        setStatusMessage(err.message || "Failed to mint NFT.");
      }
    }
  };

  const openWalletModal = () => {
    setIsModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-lg p-8 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Oxie NFTs
          </h1>
          <p className="text-gray-500 font-medium">Mint Your Exclusive NFT</p>
        </div>

        {/* Preview Image */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src="https://harlequin-interesting-lobster-179.mypinata.cloud/ipfs/bafkreia6sdo26xanct4y4zwxzebdxup6qggko76uyfxkel5qrfqzfisgt4"
            alt="Oxie NFT"
            className="relative rounded-2xl w-full shadow-lg transform transition duration-500 hover:scale-[1.02]"
          />
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
             <span className="text-gray-500 font-medium">Total Minted</span>
             <span className="text-2xl font-bold text-indigo-600">{mintCount}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-gray-500 font-medium">Network</span>
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-gray-700 font-semibold">Sei EVM Mainnet</span>
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
             <a 
               href="https://seitrace.com/address/0x282fF0aC4D4F2657A6390Badb259cC78406CCa66?chain=pacific-1"
               target="_blank"
               rel="noreferrer"
               className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center justify-center gap-1 transition-colors"
             >
               Contract: {formatAddress(CONTRACT_ADDRESS)}
               <ExternalLink size={12} />
             </a>
          </div>
        </div>

        {/* Status Messages */}
        {(error || statusMessage) && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
             status === ContractStatus.ERROR || error ? 'bg-red-50 text-red-700 border border-red-100' :
             status === ContractStatus.SUCCESS ? 'bg-green-50 text-green-700 border border-green-100' :
             'bg-blue-50 text-blue-700 border border-blue-100'
          }`}>
            {status === ContractStatus.MINTING && <Loader2 className="animate-spin shrink-0" size={20} />}
            {status === ContractStatus.SUCCESS && <CheckCircle2 className="shrink-0" size={20} />}
            {(status === ContractStatus.ERROR || error) && <AlertCircle className="shrink-0" size={20} />}
            <span className="font-medium text-sm">{error || statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!account ? (
            <button
              onClick={openWalletModal}
              disabled={isConnecting}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {isConnecting ? (
                 <Loader2 className="animate-spin" />
               ) : (
                 <Wallet />
               )}
               Connect Wallet (Multi-Chain)
            </button>
          ) : (
            <>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-2 flex items-center justify-between">
                <span className="text-sm text-indigo-600 font-medium">Connected</span>
                <span className="text-sm font-mono font-bold text-indigo-900 bg-white px-2 py-1 rounded border border-indigo-100">
                  {formatAddress(account)}
                </span>
              </div>
              
              <button
                onClick={handleMint}
                disabled={status === ContractStatus.MINTING}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === ContractStatus.MINTING ? (
                    <>
                        <Loader2 className="animate-spin" /> Minting...
                    </>
                ) : (
                    "Mint NFT"
                )}
              </button>

              <button
                onClick={disconnectWallet}
                className="w-full py-3 text-sm text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-colors"
              >
                Disconnect Wallet
              </button>
            </>
          )}
        </div>
      </div>

      <WalletModal 
        isOpen={isModalOpen}
        onClose={closeWalletModal}
        wallets={detectedWallets}
        onSelect={(wallet) => {
            connectWallet(wallet);
            closeWalletModal();
        }}
        onLegacyConnect={() => {
            connectWallet();
            closeWalletModal();
        }}
      />
    </div>
  );
};

export default App;