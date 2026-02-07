# OrcaSignal v2.0 - Privacy-Preserving DeFi Risk Intelligence

> **🏆 ETHGlobal Submission - Uniswap v4 Privacy DeFi Track**

**OrcaSignal** provides transparent, explainable risk analysis for DeFi markets, protecting users from information asymmetry while preserving privacy through on-chain verifiable risk intelligence.

## 🎯 **Problem & Solution**

**Problem**: DeFi markets suffer from information asymmetry where retail traders are exploited by informed actors with privileged access to risk data.

**Solution**: Privacy-preserving risk intelligence that levels the playing field through:
- 🔒 **No identity tracking** - Analyze patterns, not people
- 📊 **Explainable algorithms** - Every risk score has clear reasoning  
- 🛡️ **Proactive protection** - Block/warn high-risk swaps before execution
- ✅ **On-chain verifiability** - All risk data is transparent and auditable

## 🦄 **Uniswap v4 Integration**

### **OrcaSignal Hook**
Our Uniswap v4 Hook provides real-time swap validation:

```solidity
// Risk-based swap protection
function beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData) 
    external returns (bytes4)

// Transparent risk assessment
function analyzeSwapRisk(PoolKey calldata key) 
    external returns (bool shouldBlock, string memory riskReason)
```

### **Privacy-First Design**
- **Holder Concentration**: Detects manipulation without revealing identities
- **Liquidity Ownership**: Identifies risks without tracking individual LPs  
- **Governance Capture**: Analyzes voting power distribution transparently

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+
- Git

### **Installation**
```bash
git clone [repository-url]
cd orcasignal-v2
npm run install:all
```

### **Run Application**
```bash
# Start backend (port 3003)
npm run backend:dev

# Start frontend (port 3000)  
npm run frontend

# Or run both
npm run dev
```

### **Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3003

## � **Live Demo**

### **Deployed Contracts (Sepolia)**
- **OrcaSignalRegistry**: `0xDD5bFC1750eB847284E61dE6529C50b195A6F880`
- **Network**: Sepolia Testnet
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xDD5bFC1750eB847284E61dE6529C50b195A6F880)

### **Demo Flow**
1. **Connect Wallet** - MetaMask or demo wallet
2. **Analyze Token** - Enter any token address (try sample tokens)
3. **View Risk Analysis** - See explainable risk factors
4. **Uniswap Hook Demo** - See how swaps would be validated
5. **Submit to Contract** - Store risk data on-chain

## 🏗️ **Architecture**

### **Smart Contracts**
```
src/
├── OrcaSignalRegistry.sol    # Core risk analysis & storage
├── OrcaSignalHook.sol        # Uniswap v4 Hook integration  
└── YellowSessionManager.sol  # Gasless interactions
```

### **Backend Services**
```
backend/
├── server.js                 # Express API server
├── services/
│   ├── riskAnalyzer.js       # Risk calculation engine
│   └── contractService.js    # Blockchain interactions
```

### **Frontend Application**
```
frontend/src/
├── App.js                    # Main application
├── components/
│   ├── RiskAnalysis.js       # Risk visualization
│   ├── WalletConnect.js      # Wallet integration
│   └── RiskThresholds.js     # Threshold configuration
└── services/
    ├── ensService.js         # ENS name resolution
    └── yellowService.js      # Yellow Network integration
```

## 🔧 **Smart Contract Development**

### **Compile Contracts**
```bash
# Using npm scripts (works without Foundry)
npm run build

# Or with Foundry (if installed)
forge build
```

### **Run Tests**
```bash
forge test
```

### **Deploy Contracts**
```bash
# Deploy to Sepolia
npm run deploy:sepolia
```

## 🎯 **Key Features**

### **🔒 Privacy-Preserving**
- No whale identity tracking
- Pattern analysis without personal data
- Transparent algorithms with explainable results

### **📊 Risk Analysis**
- **Holder Concentration** (0-100): Token distribution analysis
- **Liquidity Ownership** (0-100): LP concentration assessment  
- **Governance Capture** (0-100): Voting power distribution

### **🦄 Uniswap v4 Integration**
- Real-time swap validation
- Configurable risk thresholds
- Transparent blocking/warning system

### **⚡ Additional Integrations**
- **Yellow Network**: Gasless interactions
- **ENS**: Human-readable addresses
- **Real-time Stats**: Dynamic dashboard updates

## 🏆 **Privacy DeFi Benefits**

### **For Traders**
- **Information Symmetry**: Access to institutional-grade risk intelligence
- **Transparent Protection**: Clear explanations for all risk assessments
- **Privacy Preservation**: No personal data collection or tracking

### **For Markets**
- **Reduced Adverse Selection**: Prevents exploitation of uninformed traders
- **Better Price Discovery**: Removes information asymmetries
- **Increased Confidence**: Transparent risk builds market trust

### **For Protocols**
- **Composable Security**: Other protocols can integrate OrcaSignal data
- **Proactive Risk Management**: Identify threats before they materialize
- **Verifiable Protection**: All assessments are auditable on-chain

## 📹 **Demo Video**

[Link to 3-minute demo video showing:]
- Problem explanation and solution overview
- Live risk analysis demonstration  
- Uniswap v4 Hook integration
- Privacy-preserving design principles
- Market impact and benefits

## 🛠️ **Technology Stack**

- **Smart Contracts**: Solidity 0.8.24, Foundry
- **Backend**: Node.js, Express, ethers.js
- **Frontend**: React, ethers.js, Lucide icons
- **Blockchain**: Ethereum, Sepolia testnet
- **Integrations**: Uniswap v4, Yellow Network, ENS

## 📄 **Documentation**

All documentation is contained in this README. The project is self-documenting with clear code structure and inline comments.

## 🤝 **Contributing**

This project was built for ETHGlobal hackathon. For questions or collaboration:

- **GitHub**: [Repository Issues]
- **Demo**: [Live Application Link]
- **Video**: [Demo Video Link]

## 📜 **License**

MIT License - Built for ETHGlobal hackathon

---

**🏆 OrcaSignal: Privacy-preserving DeFi risk intelligence that protects users without compromising transparency.**
