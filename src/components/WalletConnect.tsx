import { useWallet } from '../hooks/useWallet';
import './WalletConnect.css';

const WalletConnect = () => {
  const { account, chainId, isConnected, isLoading, connectWallet, disconnectWallet, switchNetwork } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      56: 'BSC',
      137: 'Polygon',
      11155111: 'Sepolia',
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <div className="wallet-connect">
      <div className="wallet-status">
        {!isConnected ? (
          <button 
            onClick={connectWallet} 
            disabled={isLoading}
            className="connect-btn"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="wallet-info">
            <div className="wallet-details">
              <div className="account-info">
                <span className="account-label">Address:</span>
                <span className="account-address">{formatAddress(account!)}</span>
              </div>
              <div className="network-info">
                <span className="network-label">Network:</span>
                <span className="network-name">{getNetworkName(chainId!)}</span>
              </div>
            </div>
            <div className="wallet-actions">
              <select 
                onChange={(e) => switchNetwork(Number(e.target.value))}
                value={chainId || ''}
                className="network-selector"
              >
                <option value="1">Ethereum</option>
                <option value="56">BSC</option>
                <option value="137">Polygon</option>
                <option value="11155111">Sepolia</option>
              </select>
              <button onClick={disconnectWallet} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;