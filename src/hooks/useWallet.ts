import { useState, useEffect } from 'react';

interface WalletState {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isLoading: boolean;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    chainId: null,
    isConnected: false,
    isLoading: false,
  });

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setWalletState({
          account: accounts[0] || null,
          chainId: parseInt(chainId, 16),
          isConnected: accounts.length > 0,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setWalletState(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask 钱包');
      return;
    }

    setWalletState(prev => ({ ...prev, isLoading: true }));

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setWalletState({
        account: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      account: null,
      chainId: null,
      isConnected: false,
      isLoading: false,
    });
  };

  const switchNetwork = async (chainId: number) => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        const networkData = getNetworkData(chainId);
        if (networkData) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkData],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        }
      }
      console.error('Error switching network:', error);
    }
  };

  const getNetworkData = (chainId: number) => {
    const networks: Record<number, any> = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io/'],
      },
      56: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed1.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com/'],
      },
    };
    return networks[chainId];
  };

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletState(prev => ({
          ...prev,
          account: accounts[0] || null,
          isConnected: accounts.length > 0,
        }));
      };

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16),
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};