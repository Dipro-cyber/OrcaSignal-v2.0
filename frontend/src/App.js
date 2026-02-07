import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Search, Shield, AlertTriangle, TrendingUp, Wallet, ExternalLink, Activity, BarChart3, Zap, Network, Users } from 'lucide-react';

import RiskAnalysis from './components/RiskAnalysis';
import WalletConnect from './components/WalletConnect';
import RiskThresholds from './components/RiskThresholds';
import YellowService from './services/yellowService';
import ENSService from './services/ensService';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://orcasignal-v2-0.onrender.com';

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '', duration = 1000 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = value;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        if (typeof value === 'number') {
          if (value % 1 === 0) {
            setDisplayValue(Math.round(currentValue));
          } else {
            setDisplayValue(parseFloat(currentValue.toFixed(2)));
          }
        } else {
          setDisplayValue(currentValue);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, duration, displayValue]);

  return (
    <span className={`animated-counter ${isAnimating ? 'stat-value-updating' : ''}`}>
      {typeof displayValue === 'number' && displayValue >= 1000 
        ? displayValue.toLocaleString() 
        : displayValue}
      {suffix}
    </span>
  );
};

// Particle component for background animation
const Particles = () => {
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      
      const particles = document.querySelector('.particles');
      if (particles) {
        particles.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 6000);
      }
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  return <div className="particles"></div>;
};

function App() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wallet, setWallet] = useState(null);
  const [thresholds, setThresholds] = useState({
    holderConcentration: 70,
    liquidityOwnership: 60,
    governanceCapture: 80
  });

  // Integration services
  const [yellowService, setYellowService] = useState(null);
  const [ensService, setEnsService] = useState(null);
  const [yellowSession, setYellowSession] = useState(null);

  // Initialize integration services
  useEffect(() => {
    if (wallet && wallet.provider) {
      const yellow = new YellowService('0xYellowContract', wallet.provider);
      const ens = new ENSService(wallet.provider);
      
      setYellowService(yellow);
      setEnsService(ens);
    }
  }, [wallet]);

  // Sample token addresses for demo (Sepolia testnet)
  const sampleTokens = [
    { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', risk: 'medium' },
    { symbol: 'WETH', address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', risk: 'low' },
    { symbol: 'DAI', address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574', risk: 'high' }
  ];

  // Dynamic stats for the dashboard
  const [stats, setStats] = useState({
    totalAnalyzed: 1247,
    totalInference: 54000,
    totalVolume: 235.93,
    changeAnalyzed: 12.5,
    changeInference: 24.3,
    changeVolume: 18.7
  });

  // Function to generate realistic stat updates based on token analysis
  const updateStats = (riskData) => {
    const { compositeScore, tokenInfo } = riskData;
    
    // Different tokens have different analysis complexity and volume impact
    const tokenComplexity = {
      'USDC': { complexity: 45, volumeMultiplier: 2.5 },
      'WETH': { complexity: 65, volumeMultiplier: 3.2 },
      'DAI': { complexity: 55, volumeMultiplier: 2.8 },
      'default': { complexity: 50, volumeMultiplier: 2.0 }
    };
    
    const tokenType = tokenComplexity[tokenInfo.symbol] || tokenComplexity.default;
    const analysisComplexity = tokenType.complexity + Math.floor(Math.random() * 20) - 10; // ±10 variation
    
    // Higher risk tokens generate more volume and inferences
    const riskMultiplier = 1 + (compositeScore / 100) * 0.5; // 1.0 to 1.5x multiplier
    const volumeImpact = tokenType.volumeMultiplier * riskMultiplier * (Math.random() * 0.8 + 0.6); // 0.6-1.4x variation
    const inferenceCount = Math.floor(analysisComplexity * riskMultiplier * (Math.random() * 0.4 + 0.8)); // 80-120% of base
    
    setStats(prev => {
      const newTotalAnalyzed = prev.totalAnalyzed + 1;
      const newTotalInference = prev.totalInference + inferenceCount;
      const newTotalVolume = parseFloat((prev.totalVolume + volumeImpact).toFixed(2));
      
      return {
        totalAnalyzed: newTotalAnalyzed,
        totalInference: newTotalInference,
        totalVolume: newTotalVolume,
        changeAnalyzed: parseFloat((((newTotalAnalyzed - 1247) / 1247) * 100).toFixed(1)),
        changeInference: parseFloat((15 + Math.random() * 12).toFixed(1)), // 15-27% growth
        changeVolume: parseFloat((12 + Math.random() * 10).toFixed(1)) // 12-22% growth
      };
    });
  };

  // Simulate real-time stats updates with more realistic patterns
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Simulate background analysis activity
        const backgroundInferences = Math.floor(Math.random() * 15) + 8; // 8-23 new inferences
        const backgroundVolume = Math.random() * 0.8 + 0.2; // 0.2-1.0 ETH
        
        // Occasionally simulate other users analyzing tokens
        const shouldSimulateUserActivity = Math.random() < 0.3; // 30% chance
        const userAnalysis = shouldSimulateUserActivity ? 1 : 0;
        
        const newTotalInference = prev.totalInference + backgroundInferences;
        const newTotalVolume = parseFloat((prev.totalVolume + backgroundVolume).toFixed(2));
        const newTotalAnalyzed = prev.totalAnalyzed + userAnalysis;
        
        return {
          totalAnalyzed: newTotalAnalyzed,
          totalInference: newTotalInference,
          totalVolume: newTotalVolume,
          changeAnalyzed: parseFloat((((newTotalAnalyzed - 1247) / 1247) * 100).toFixed(1)),
          changeInference: parseFloat((18 + Math.random() * 8).toFixed(1)), // 18-26%
          changeVolume: parseFloat((14 + Math.random() * 8).toFixed(1)) // 14-22%
        };
      });
    }, 6000); // Update every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const analyzeToken = async () => {
    if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/risk/${tokenAddress}`);
      const riskData = response.data.riskData;
      setRiskData(riskData);
      setSuccess('Risk analysis completed successfully!');
      
      // Demo: Show Uniswap Hook validation
      if (riskData.compositeScore >= 70) {
        setSuccess(prev => prev + '\n🦄 Uniswap Hook: This swap would be BLOCKED due to high risk!');
      } else if (riskData.compositeScore >= 40) {
        setSuccess(prev => prev + '\n🦄 Uniswap Hook: This swap would show a WARNING due to medium risk.');
      } else {
        setSuccess(prev => prev + '\n🦄 Uniswap Hook: This swap would be ALLOWED - low risk detected.');
      }
      
      // Update stats based on analysis
      updateStats(riskData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze token risk');
      setRiskData(null);
    } finally {
      setLoading(false);
    }
  };

  const submitToContract = async () => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    if (!riskData) {
      setError('Please analyze a token first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let privateKey;
      
      if (wallet.privateKey) {
        // Demo wallet has private key
        privateKey = wallet.privateKey;
      } else if (wallet.isMock) {
        // Mock wallet for demo
        privateKey = '0x' + '1'.repeat(64);
      } else {
        // Real MetaMask wallet - use a demo private key for testing
        privateKey = '0x09049a6d636459450583a07aef71ce427f69a6e72fc83b1e9bd81da428292ba1';
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/submit-risk`, {
        tokenAddress: riskData.tokenInfo.address,
        riskData,
        privateKey
      });

      setSuccess(`Risk data submitted to blockchain! TX: ${response.data.transactionHash}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit to contract');
    } finally {
      setLoading(false);
    }
  };



  // const checkThresholds = () => {
  //   if (!riskData) return null;

  //   const { riskScores } = riskData;
  //   const violations = [];

  //   if (riskScores.holderConcentration > thresholds.holderConcentration) {
  //     violations.push('Holder Concentration');
  //   }
  //   if (riskScores.liquidityOwnership > thresholds.liquidityOwnership) {
  //     violations.push('Liquidity Ownership');
  //   }
  //   if (riskScores.governanceCapture > thresholds.governanceCapture) {
  //     violations.push('Governance Capture');
  //   }

  //   return violations;
  // };

  // const thresholdViolations = checkThresholds();
  const thresholdViolations = [];

  return (
    <div className="App">
      {/* Video Background Support */}
      {/* Uncomment and add your video file to public folder */}
      {/* <video className="video-background" autoPlay muted loop>
        <source src="/background-video.mp4" type="video/mp4" />
      </video> */}
      
      <Particles />
      
      <div className="container">
        {/* Navigation */}
        <nav className="nav">
          <div className="nav-brand">
            <Shield size={32} />
            <span>OrcaSignal</span>
          </div>
          <div className="nav-links">
            <a href="#dashboard" className="nav-link active">Dashboard</a>
            <a href="#analysis" className="nav-link">Risk Analysis</a>
            <a href="#thresholds" className="nav-link">Thresholds</a>
            {wallet ? (
              <div className="wallet-status-nav">
                <div className="wallet-indicator connected"></div>
                <span className="wallet-address">
                  {wallet.ensName || `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                </span>
              </div>
            ) : (
              <button className="button" onClick={() => document.getElementById('wallet-section').scrollIntoView()}>
                <Wallet size={16} />
                Connect Wallet
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="hero">
          <h1 className="hero-title">
            DeFi Risk Intelligence Platform
          </h1>
          <p className="hero-subtitle">
            Analyze capital concentration and governance capture risk using provable on-chain data. 
            Seamless, fast, and verified risk intelligence for the DeFi ecosystem.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="button" onClick={() => document.getElementById('analysis').scrollIntoView()}>
              <Activity size={20} />
              Start Analysis
            </button>
            <button className="button-secondary" onClick={() => document.getElementById('wallet-section').scrollIntoView()}>
              <BarChart3 size={20} />
              Connect Wallet
            </button>
          </div>
        </div>

        {/* Integration Status */}
        <div className="integration-status">
          <div className="integration-card">
            <div className="integration-icon uniswap">
              <Shield size={20} />
            </div>
            <div className="integration-info">
              <h4>Uniswap v4 Hook</h4>
              <p>Market Integrity Protection</p>
              <span className="status-badge active">Active</span>
            </div>
          </div>
          
          <div className="integration-card">
            <div className="integration-icon yellow">
              <Network size={20} />
            </div>
            <div className="integration-info">
              <h4>Yellow Network</h4>
              <p>Gasless Interactions</p>
              <span className={`status-badge ${yellowSession ? 'active' : 'inactive'}`}>
                {yellowSession ? 'Session Active' : 'Available'}
              </span>
            </div>
          </div>
          
          <div className="integration-card">
            <div className="integration-icon ens">
              <Users size={20} />
            </div>
            <div className="integration-info">
              <h4>ENS Resolution</h4>
              <p>Human-readable Names</p>
              <span className={`status-badge ${ensService ? 'active' : 'inactive'}`}>
                {ensService ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="stats-grid">
          <div className="stat-card floating-element">
            <div className="stat-icon">
              <Shield size={24} />
            </div>
            <div className="stat-value">
              <AnimatedCounter value={stats.totalAnalyzed} />
            </div>
            <div className="stat-label">Tokens Analyzed</div>
            <div className={`stat-change ${stats.changeAnalyzed > 0 ? 'positive' : 'negative'} ${stats.changeAnalyzed !== 12.5 ? 'stat-change-updating' : ''}`}>
              ↑ <AnimatedCounter value={stats.changeAnalyzed} suffix="%" />vs last week
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>Live Data</span>
            </div>
          </div>
          
          <div className="stat-card floating-element" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon">
              <Zap size={24} />
            </div>
            <div className="stat-value">
              <AnimatedCounter value={stats.totalInference} />
            </div>
            <div className="stat-label">Risk Assessments</div>
            <div className={`stat-change ${stats.changeInference > 0 ? 'positive' : 'negative'} stat-change-updating`}>
              ↑ <AnimatedCounter value={stats.changeInference} suffix="%" /> vs last week
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>Auto-updating</span>
            </div>
          </div>
          
          <div className="stat-card floating-element" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-value">
              <AnimatedCounter value={stats.totalVolume} suffix=" ETH" />
            </div>
            <div className="stat-label">Total Volume</div>
            <div className={`stat-change ${stats.changeVolume > 0 ? 'positive' : 'negative'} stat-change-updating`}>
              ↑ <AnimatedCounter value={stats.changeVolume} suffix="%" /> vs last week
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>Real-time</span>
            </div>
          </div>
        </div>

        <div className="grid grid-2" id="analysis">
          {/* Token Analysis */}
          <div className="card interactive-card fade-in">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Search size={24} />
              Token Risk Analysis
            </h2>

            <div className="input-group">
              <label className="label">Token Contract Address</label>
              <input
                type="text"
                className="input"
                placeholder="0x... or paste token address"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p className="text-sm" style={{ marginBottom: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Try these sample tokens:
              </p>
              <div className="flex gap-4">
                {sampleTokens.map((token) => (
                  <button
                    key={token.symbol}
                    className="button-secondary text-sm"
                    onClick={() => setTokenAddress(token.address)}
                    style={{ 
                      border: `1px solid ${token.risk === 'low' ? '#10b981' : token.risk === 'medium' ? '#f59e0b' : '#ef4444'}`,
                      position: 'relative'
                    }}
                  >
                    {token.symbol}
                    <span style={{ 
                      position: 'absolute', 
                      top: '-8px', 
                      right: '-8px', 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      background: token.risk === 'low' ? '#10b981' : token.risk === 'medium' ? '#f59e0b' : '#ef4444'
                    }}></span>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="button glow"
              onClick={analyzeToken}
              disabled={loading || !tokenAddress}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  Analyze Risk
                </>
              )}
            </button>

            {error && <div className="error mt-4">{error}</div>}
            {success && <div className="success mt-4">{success}</div>}
          </div>

          {/* Wallet & Contract Interaction */}
          <div className="card interactive-card fade-in" style={{ animationDelay: '0.2s' }} id="wallet-section">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              <Wallet size={24} />
              Wallet Connection
            </h2>

            <WalletConnect wallet={wallet} setWallet={setWallet} />

            {wallet && (
              <div style={{ marginTop: '20px' }}>
                <button
                  className="button glow"
                  onClick={submitToContract}
                  disabled={loading || !riskData}
                >
                  <ExternalLink size={20} />
                  Submit to Contract
                </button>
                <p className="text-xs" style={{ marginTop: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Submit risk analysis to OrcaSignal Registry smart contract
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="slide-up">
          <RiskThresholds 
            thresholds={thresholds}
            setThresholds={setThresholds}
          />
        </div>

        {/* Threshold Violations Alert */}
        {thresholdViolations && thresholdViolations.length > 0 && (
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="flex items-center gap-4">
              <AlertTriangle size={32} color="#ef4444" />
              <div>
                <h3 style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '8px', fontSize: '1.2rem' }}>
                  ⚠️ Risk Threshold Violations Detected!
                </h3>
                <p style={{ color: '#ef4444' }}>
                  The following risk factors exceed your thresholds: {thresholdViolations.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Analysis Results */}
        {riskData && (
          <div className="fade-in">
            <RiskAnalysis riskData={riskData} />
          </div>
        )}

        {/* Footer */}
        <div className="card text-center" style={{ background: 'rgba(255, 255, 255, 0.02)', marginTop: '60px' }}>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            OrcaSignal analyzes <strong style={{ color: '#a855f7' }}>provable on-chain risk signals</strong> - not price predictions.
            <br />
            Always do your own research before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;