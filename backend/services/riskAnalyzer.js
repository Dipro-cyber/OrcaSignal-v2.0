const { ethers } = require('ethers');
const NodeCache = require('node-cache');

// Cache for 5 minutes to avoid excessive RPC calls
const cache = new NodeCache({ stdTTL: 300 });

class RiskAnalyzer {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo'
    );
    
    // ERC-20 ABI for balance queries
    this.erc20Abi = [
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ];
  }

  /**
   * Main function to analyze token risk
   * @param {string} tokenAddress - Token contract address
   * @returns {Object} Risk analysis data
   */
  async analyzeToken(tokenAddress) {
    const cacheKey = `risk_${tokenAddress}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log(`Returning cached risk data for ${tokenAddress}`);
      return cached;
    }

    try {
      // For demo purposes, we'll use mock data instead of trying to call contracts
      // that may not exist on the current network
      console.log(`Analyzing token: ${tokenAddress}`);

      // Generate realistic mock data based on token address
      const mockTokenInfo = this.getMockTokenInfo(tokenAddress);
      
      // Analyze different risk factors (using mock data for demo)
      const holderConcentration = this.generateRealisticScore(15, 85);
      const liquidityOwnership = this.generateRealisticScore(20, 75); 
      const governanceCapture = this.generateRealisticScore(10, 90);

      const riskData = {
        tokenInfo: mockTokenInfo,
        riskScores: {
          holderConcentration,
          liquidityOwnership,
          governanceCapture
        },
        compositeScore: Math.round((holderConcentration + liquidityOwnership + governanceCapture) / 3),
        lastAnalyzed: new Date().toISOString(),
        methodology: {
          holderConcentration: 'Top 10 holders as % of total supply',
          liquidityOwnership: 'Largest LP holder as % of total LP supply',
          governanceCapture: 'Top 5 voters as % of total voting power'
        },
        isDemo: true,
        network: 'sepolia'
      };

      console.log(`Generated risk analysis for ${mockTokenInfo.symbol}: H:${holderConcentration}, L:${liquidityOwnership}, G:${governanceCapture}`);

      // Cache the result
      cache.set(cacheKey, riskData);
      
      return riskData;
      
    } catch (error) {
      console.error(`Error analyzing token ${tokenAddress}:`, error);
      throw new Error(`Failed to analyze token: ${error.message}`);
    }
  }

  /**
   * Analyze holder concentration risk
   * @param {ethers.Contract} contract - Token contract instance
   * @param {BigInt} totalSupply - Total token supply
   * @returns {number} Concentration score (0-100)
   */
  async analyzeHolderConcentration(contract, totalSupply) {
    try {
      // For demo purposes, we'll simulate analysis of top holders
      // In production, you'd need to:
      // 1. Query transfer events to build holder list
      // 2. Get current balances for top holders
      // 3. Calculate concentration percentage
      
      // Simulate getting top holder addresses (in production, derive from events)
      const topHolders = await this.getTopHolders(contract.target);
      
      let topHoldersBalance = 0n;
      
      for (const holder of topHolders) {
        try {
          const balance = await contract.balanceOf(holder);
          topHoldersBalance += balance;
        } catch (error) {
          console.warn(`Failed to get balance for holder ${holder}:`, error.message);
        }
      }
      
      // Calculate concentration percentage
      const concentrationPercentage = Number(topHoldersBalance * 100n / totalSupply);
      
      // Cap at 100 and ensure it's a valid score
      return Math.min(100, Math.max(0, Math.round(concentrationPercentage)));
      
    } catch (error) {
      console.warn('Holder concentration analysis failed:', error.message);
      // Return moderate risk score if analysis fails
      return 50;
    }
  }

  /**
   * Analyze liquidity ownership concentration
   * @param {string} tokenAddress - Token contract address
   * @returns {number} Liquidity ownership score (0-100)
   */
  async analyzeLiquidityOwnership(tokenAddress) {
    try {
      // For demo purposes, simulate LP analysis
      // In production, you'd need to:
      // 1. Find major DEX pairs (Uniswap, Sushiswap, etc.)
      // 2. Get LP token contracts for those pairs
      // 3. Analyze LP token holder distribution
      // 4. Calculate largest LP holder percentage
      
      // Simulate LP concentration analysis
      const simulatedLPConcentration = this.generateRealisticScore(30, 70);
      
      console.log(`Simulated LP concentration: ${simulatedLPConcentration}%`);
      return simulatedLPConcentration;
      
    } catch (error) {
      console.warn('Liquidity ownership analysis failed:', error.message);
      return 50;
    }
  }

  /**
   * Analyze governance capture risk
   * @param {string} tokenAddress - Token contract address  
   * @returns {number} Governance capture score (0-100)
   */
  async analyzeGovernanceCapture(tokenAddress) {
    try {
      // For demo purposes, simulate governance analysis
      // In production, you'd need to:
      // 1. Check if token has governance functionality
      // 2. Analyze voting power distribution
      // 3. Look at proposal history and voter participation
      // 4. Calculate top voter concentration
      
      // Simulate governance concentration analysis
      const simulatedGovConcentration = this.generateRealisticScore(20, 80);
      
      console.log(`Simulated governance concentration: ${simulatedGovConcentration}%`);
      return simulatedGovConcentration;
      
    } catch (error) {
      console.warn('Governance capture analysis failed:', error.message);
      return 50;
    }
  }

  /**
   * Get top token holders (simulated for demo)
   * @param {string} tokenAddress - Token contract address
   * @returns {Array<string>} Array of top holder addresses
   */
  async getTopHolders(tokenAddress) {
    // In production, you'd query Transfer events and build holder list
    // For demo, return some realistic-looking addresses
    return [
      '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503', // Binance hot wallet
      '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3', // Binance cold wallet  
      '0x28C6c06298d514Db089934071355E5743bf21d60', // Binance 14
      '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', // Binance 15
      '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d', // Binance 16
      '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F', // Binance 17
      '0x9696f59E4d72E237BE84fFD425DCaD154Bf96976', // Binance 18
      '0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67', // Binance 19
      '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b', // OKEx
      '0x1522900b6dAfac587D499A862861C0869BE6e428'  // Kraken
    ];
  }

  /**
   * Generate realistic risk scores for demo
   * @param {number} min - Minimum score
   * @param {number} max - Maximum score
   * @returns {number} Random score in range
   */
  generateRealisticScore(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get mock token info for demo purposes
   * @param {string} tokenAddress - Token contract address
   * @returns {Object} Mock token information
   */
  getMockTokenInfo(tokenAddress) {
    // Known token mappings for demo
    const knownTokens = {
      '0xA0b86a33E6441b8e8C7C7b0b8e8C7C7b0b8e8C7C': {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        totalSupply: '1000000000000000'
      },
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        totalSupply: '5000000000000000000000000'
      },
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        totalSupply: '10000000000000000000000000000'
      }
    };

    const known = knownTokens[tokenAddress];
    if (known) {
      return {
        address: tokenAddress,
        ...known
      };
    }

    // Generate mock data for unknown tokens
    const symbols = ['TOKEN', 'COIN', 'DEFI', 'YIELD', 'SWAP', 'POOL'];
    const names = ['Demo Token', 'Test Coin', 'DeFi Protocol', 'Yield Token', 'Swap Token', 'Pool Token'];
    
    const hash = tokenAddress.slice(2, 10);
    const index = parseInt(hash, 16) % symbols.length;
    
    return {
      address: tokenAddress,
      symbol: symbols[index],
      name: names[index],
      decimals: 18,
      totalSupply: (Math.random() * 1000000000 + 1000000).toString()
    };
  }
}

module.exports = new RiskAnalyzer();