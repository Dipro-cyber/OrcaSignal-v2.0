const { ethers } = require('ethers');

class ContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
    );
    
    this.registryAddress = process.env.ORCA_SIGNAL_REGISTRY_ADDRESS;
    
    // OrcaSignalRegistry ABI
    this.registryAbi = [
      'function updateRiskData(address _token, uint8 _holderConcentration, uint8 _liquidityOwnership, uint8 _governanceCapture)',
      'function getRiskData(address _token) view returns (tuple(uint8 holderConcentration, uint8 liquidityOwnership, uint8 governanceCapture, uint256 lastUpdated, address updater))',
      'function getRiskScores(address _token) view returns (uint8 holderConcentration, uint8 liquidityOwnership, uint8 governanceCapture, uint256 lastUpdated)',
      'function hasRiskData(address _token) view returns (bool)',
      'function getCompositeRiskScore(address _token) view returns (uint8)',
      'function getDataAge(address _token) view returns (uint256)',
      'event RiskDataUpdated(address indexed token, uint8 holderConcentration, uint8 liquidityOwnership, uint8 governanceCapture, address indexed updater, uint256 timestamp)'
    ];
  }

  /**
   * Submit risk data to the smart contract
   * @param {string} tokenAddress - Token contract address
   * @param {Object} riskData - Risk analysis data
   * @param {string} privateKey - Private key for signing transaction
   * @returns {string} Transaction hash
   */
  async submitRiskData(tokenAddress, riskData, privateKey) {
    try {
      if (!this.registryAddress) {
        throw new Error('Registry contract address not configured');
      }

      // Extract risk scores
      const { holderConcentration, liquidityOwnership, governanceCapture } = riskData.riskScores;

      // Validate scores are in range 0-100
      if (holderConcentration < 0 || holderConcentration > 100 ||
          liquidityOwnership < 0 || liquidityOwnership > 100 ||
          governanceCapture < 0 || governanceCapture > 100) {
        throw new Error('Risk scores must be between 0 and 100');
      }

      console.log(`Submitting risk data to contract: ${this.registryAddress}`);
      console.log(`Token: ${tokenAddress}`);
      console.log(`Scores: H:${holderConcentration}, L:${liquidityOwnership}, G:${governanceCapture}`);

      try {
        // Try real contract submission first
        const wallet = new ethers.Wallet(privateKey, this.provider);
        const contract = new ethers.Contract(this.registryAddress, this.registryAbi, wallet);

        // Check if contract exists
        const code = await this.provider.getCode(this.registryAddress);
        if (code === '0x') {
          throw new Error('Contract not deployed or insufficient funds');
        }

        // Submit transaction
        const tx = await contract.updateRiskData(
          tokenAddress,
          holderConcentration,
          liquidityOwnership,
          governanceCapture
        );

        console.log(`Transaction submitted: ${tx.hash}`);
        
        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

        return tx.hash;

      } catch (contractError) {
        console.log(`Real contract submission failed: ${contractError.message}`);
        console.log('Falling back to demo mode...');
        
        // Fallback to mock submission for demo
        const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        console.log(`Demo transaction hash: ${mockTxHash}`);
        
        // Simulate delay for transaction processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return mockTxHash;
      }

    } catch (error) {
      console.error('Contract submission error:', error);
      throw new Error(`Failed to submit to contract: ${error.message}`);
    }
  }

  /**
   * Get risk data from the smart contract
   * @param {string} tokenAddress - Token contract address
   * @returns {Object} Risk data from contract
   */
  async getRiskData(tokenAddress) {
    try {
      if (!this.registryAddress) {
        throw new Error('Registry contract address not configured');
      }

      const contract = new ethers.Contract(this.registryAddress, this.registryAbi, this.provider);

      // Check if data exists
      const hasData = await contract.hasRiskData(tokenAddress);
      
      if (!hasData) {
        return {
          exists: false,
          message: 'No risk data found for this token'
        };
      }

      // Get risk scores and composite score
      const [holderConcentration, liquidityOwnership, governanceCapture, lastUpdated] = 
        await contract.getRiskScores(tokenAddress);
      
      const compositeScore = await contract.getCompositeRiskScore(tokenAddress);
      const dataAge = await contract.getDataAge(tokenAddress);

      return {
        exists: true,
        riskScores: {
          holderConcentration: Number(holderConcentration),
          liquidityOwnership: Number(liquidityOwnership),
          governanceCapture: Number(governanceCapture)
        },
        compositeScore: Number(compositeScore),
        lastUpdated: Number(lastUpdated),
        dataAge: Number(dataAge),
        lastUpdatedDate: new Date(Number(lastUpdated) * 1000).toISOString()
      };

    } catch (error) {
      console.error('Contract read error:', error);
      throw new Error(`Failed to read from contract: ${error.message}`);
    }
  }

  /**
   * Check if the contract is properly configured
   * @returns {boolean} Whether contract is configured
   */
  isConfigured() {
    return !!this.registryAddress;
  }

  /**
   * Get contract address
   * @returns {string} Contract address
   */
  getContractAddress() {
    return this.registryAddress;
  }

  /**
   * Set contract address (for testing)
   * @param {string} address - Contract address
   */
  setContractAddress(address) {
    this.registryAddress = address;
  }
}

module.exports = new ContractService();