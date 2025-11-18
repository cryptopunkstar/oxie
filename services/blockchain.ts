export const CONTRACT_ADDRESS = '0x282fF0aC4D4F2657A6390Badb259cC78406CCa66';
export const SEI_CHAIN_ID_HEX = '0x531'; // 1329
export const SEI_CHAIN_ID_DEC = 1329;

export const SEI_CHAIN_PARAMS = {
    chainId: SEI_CHAIN_ID_HEX,
    chainName: 'Sei Network',
    nativeCurrency: {
        name: 'SEI',
        symbol: 'SEI',
        decimals: 18
    },
    rpcUrls: ['https://evm-rpc.sei-apis.com'],
    blockExplorerUrls: ['https://seitrace.com']
};

export const CONTRACT_ABI = [
    "function mint() payable",
    "function totalSupply() view returns (uint256)"
];

export const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};