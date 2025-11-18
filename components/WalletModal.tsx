import React from 'react';
import { EIP6963ProviderDetail } from '../types';
import { X, Wallet } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: EIP6963ProviderDetail[];
  onSelect: (wallet: EIP6963ProviderDetail) => void;
  onLegacyConnect: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSelect,
  onLegacyConnect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Connect Wallet</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <button
                key={wallet.info.uuid}
                onClick={() => onSelect(wallet)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:shadow-md group"
              >
                <span className="font-semibold text-gray-800 group-hover:text-indigo-600">{wallet.info.name}</span>
                <img src={wallet.info.icon} alt={wallet.info.name} className="w-8 h-8" />
              </button>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
                <p className="mb-4">No EIP-6963 wallets detected.</p>
                <button 
                    onClick={onLegacyConnect}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all hover:shadow-md text-gray-800 font-semibold"
                >
                    <Wallet size={20} />
                    Standard Connect (MetaMask/Rabby)
                </button>
            </div>
          )}
          
          {/* Always show legacy option if wallets are detected but user wants something else (hidden if only legacy is shown above to avoid dupe) */}
          {wallets.length > 0 && (
             <button 
                onClick={onLegacyConnect}
                className="w-full flex items-center justify-center gap-2 p-3 mt-2 text-sm text-gray-500 hover:text-gray-700"
             >
                 Or use standard injected wallet
             </button>
          )}
        </div>
      </div>
    </div>
  );
};