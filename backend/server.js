const express = require('express');
const cors = require('cors');
require('dotenv').config();

const riskAnalyzer = require('./services/riskAnalyzer');
const contractService = require('./services/contractService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get risk analysis for a token
app.get('/api/risk/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid token address format' 
      });
    }

    console.log(`Analyzing risk for token: ${tokenAddress}`);
    
    const riskData = await riskAnalyzer.analyzeToken(tokenAddress);
    
    res.json({
      success: true,
      tokenAddress,
      riskData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze token risk',
      details: error.message 
    });
  }
});

// Submit risk data to smart contract
app.post('/api/submit-risk', async (req, res) => {
  try {
    const { tokenAddress, riskData, privateKey } = req.body;
    
    if (!tokenAddress || !riskData || !privateKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: tokenAddress, riskData, privateKey' 
      });
    }

    console.log(`Submitting risk data for token: ${tokenAddress}`);
    
    const txHash = await contractService.submitRiskData(
      tokenAddress, 
      riskData, 
      privateKey
    );
    
    res.json({
      success: true,
      tokenAddress,
      transactionHash: txHash,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Risk submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit risk data',
      details: error.message 
    });
  }
});

// Get risk data from smart contract
app.get('/api/contract-risk/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;
    
    if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid token address format' 
      });
    }

    const contractRiskData = await contractService.getRiskData(tokenAddress);
    
    res.json({
      success: true,
      tokenAddress,
      contractRiskData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Contract risk fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contract risk data',
      details: error.message 
    });
  }
});

// Get supported tokens (Sepolia testnet addresses)
app.get('/api/supported-tokens', (req, res) => {
  const supportedTokens = [
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      symbol: 'USDC',
      name: 'USD Coin (Sepolia)',
      decimals: 6
    },
    {
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      symbol: 'WETH',
      name: 'Wrapped Ether (Sepolia)',
      decimals: 18
    },
    {
      address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
      symbol: 'DAI',
      name: 'Dai Stablecoin (Sepolia)',
      decimals: 18
    }
  ];
  
  res.json({
    success: true,
    tokens: supportedTokens,
    count: supportedTokens.length,
    network: 'sepolia'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🐋 OrcaSignal Backend running on port ${PORT}`);
  console.log(`📊 Risk analysis endpoint: http://localhost:${PORT}/api/risk/:tokenAddress`);
  console.log(`🔗 Contract interaction: http://localhost:${PORT}/api/submit-risk`);
});