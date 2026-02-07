import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Check, AlertCircle, Zap, Shield } from 'lucide-react';

const WalletConnect = ({ wallet, setWallet }) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [ensName, setEnsName] = useState('');
  const [loadingEns, setLoadingEns] = useState(false);

  // Resolve ENS name when wallet connects
  useEffect(() => {
    const resolveENS = async () => {
      if (wallet && wallet.provider && wallet.address) {
        setLoadingEns(true);
        try {
          const ensName = await wallet.provider.lookupAddress(wallet.address);
          setEnsName(ensName || '');
        } catch (error) {
          console.log('ENS resolution failed:', error.message);
          setEnsName('');
        } finally {
          setLoadingEns(false);
        }
      } else {
        setEnsName('');
      }
    };

    resolveENS();
  }, [wallet]);

  const connectWallet = async () => {
    setConnecting(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Get network info
        const network = await provider.getNetwork();
        
        setWallet({
          address,
          provider,
          signer,
          network: network.name,
          chainId: Number(network.chainId)
        });
        
      } else {
        setError('MetaMask not detected. Please install MetaMask to continue.');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setError('');
  };

  // For demo purposes, create a mock wallet
  const createMockWallet = () => {
    const mockWallet = ethers.Wallet.createRandom();
    setWallet({
      address: mockWallet.address,
      privateKey: mockWallet.privateKey,
      provider: null,
      signer: null,
      network: 'sepolia',
      chainId: 11155111,
      isMock: true
    });
  };

  if (wallet) {
    return (
      <div className="wallet-connected floating-element">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="wallet-status-icon">
              <Check size={24} />
            </div>
            <div>
              <h4 className="wallet-status-title">
                Wallet Connected
              </h4>
              <p className="wallet-status-address">
                {loadingEns ? (
                  <span>🔍 Resolving ENS...</span>
                ) : ensName ? (
                  <span>
                    <strong>{ensName}</strong>
                    <br />
                    <small style={{ opacity: 0.7 }}>
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                    </small>
                  </span>
                ) : (
                  `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`
                )}
              </p>
              <p className="wallet-status-network">
                Network: {wallet.network} {wallet.isMock && '(Demo)'}
                {ensName && <span style={{ marginLeft: '8px', color: '#10b981' }}>✓ ENS</span>}
              </p>
            </div>
          </div>
          <button
            className="button-disconnect"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="error mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          className="button glow"
          onClick={connectWallet}
          disabled={connecting}
          style={{ flex: 1 }}
        >
          {connecting ? (
            <>
              <div className="loading-spinner" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Connect MetaMask
            </>
          )}
        </button>
        
        <button
          className="button-secondary glow"
          onClick={createMockWallet}
          disabled={connecting}
          style={{ 
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05))',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: '#a855f7'
          }}
        >
          <Zap size={20} />
          Demo Wallet
        </button>
      </div>
      
      <div className="card" style={{ 
        background: 'rgba(255, 255, 255, 0.02)', 
        marginTop: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex items-center gap-3 mb-3">
          <Shield size={16} color="#a855f7" />
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', fontWeight: '600' }}>
            Wallet Options
          </span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.4' }}>
          Connect your wallet to submit risk data to the blockchain, or use Demo Wallet for testing without real transactions.
        </p>
      </div>
    </div>
  );
};

export default WalletConnect;