import { Eip1193Provider, BrowserProvider } from 'ethers';

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
}

export interface EIP6963AnnounceProviderEvent extends CustomEvent {
  detail: {
    info: EIP6963ProviderInfo;
    provider: Eip1193Provider;
  };
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
        isMetaMask?: boolean;
        isRabby?: boolean;
        request?: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
  interface WindowEventMap {
    "eip6963:announceProvider": EIP6963AnnounceProviderEvent;
  }
}

export enum ContractStatus {
    IDLE = 'IDLE',
    MINTING = 'MINTING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}