/**
 * ENS Integration Service
 * Resolves wallet addresses to ENS names for enhanced UX
 */

import { ethers } from 'ethers';

class ENSService {
  constructor(provider) {
    this.provider = provider;
    this.cache = new Map();
    this.reverseCache = new Map();
    
    // Cache TTL: 5 minutes
    this.cacheTTL = 5 * 60 * 1000;
  }

  /**
   * Resolve address to ENS name
   */
  async resolveAddress(address) {
    if (!address || !ethers.isAddress(address)) {
      return null;
    }

    // Check cache first
    const cacheKey = address.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.name;
    }

    try {
      console.log(`🔍 Resolving ENS for ${address}...`);
      
      // Resolve ENS name
      const ensName = await this.provider.lookupAddress(address);
      
      if (ensName) {
        // Verify reverse resolution
        const resolvedAddress = await this.provider.resolveName(ensName);
        if (resolvedAddress && resolvedAddress.toLowerCase() === address.toLowerCase()) {
          // Cache the result
          this.cache.set(cacheKey, {
            name: ensName,
            timestamp: Date.now()
          });
          
          console.log(`✅ Resolved ${address} → ${ensName}`);
          return ensName;
        }
      }
      
      // Cache null result to avoid repeated lookups
      this.cache.set(cacheKey, {
        name: null,
        timestamp: Date.now()
      });
      
      return null;
      
    } catch (error) {
      console.warn(`⚠️ ENS resolution failed for ${address}:`, error.message);
      
      // Cache null result
      this.cache.set(cacheKey, {
        name: null,
        timestamp: Date.now()
      });
      
      return null;
    }
  }

  /**
   * Resolve ENS name to address
   */
  async resolveName(ensName) {
    if (!ensName || !ensName.includes('.')) {
      return null;
    }

    // Check cache first
    const cacheKey = ensName.toLowerCase();
    const cached = this.reverseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.address;
    }

    try {
      console.log(`🔍 Resolving address for ${ensName}...`);
      
      const address = await this.provider.resolveName(ensName);
      
      if (address) {
        // Cache the result
        this.reverseCache.set(cacheKey, {
          address,
          timestamp: Date.now()
        });
        
        console.log(`✅ Resolved ${ensName} → ${address}`);
        return address;
      }
      
      return null;
      
    } catch (error) {
      console.warn(`⚠️ ENS name resolution failed for ${ensName}:`, error.message);
      return null;
    }
  }

  /**
   * Get display name for address (ENS name or shortened address)
   */
  async getDisplayName(address, options = {}) {
    const { 
      showFullAddress = false, 
      prefixLength = 6, 
      suffixLength = 4 
    } = options;

    if (!address || !ethers.isAddress(address)) {
      return 'Unknown';
    }

    // Try to resolve ENS name
    const ensName = await this.resolveAddress(address);
    
    if (ensName) {
      return ensName;
    }

    // Fallback to shortened address
    if (showFullAddress) {
      return address;
    }

    return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
  }

  /**
   * Batch resolve multiple addresses
   */
  async batchResolveAddresses(addresses) {
    const results = new Map();
    
    // Process in parallel with limit to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      const promises = batch.map(async (address) => {
        const ensName = await this.resolveAddress(address);
        return { address, ensName };
      });
      
      const batchResults = await Promise.all(promises);
      batchResults.forEach(({ address, ensName }) => {
        results.set(address, ensName);
      });
      
      // Small delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Get ENS avatar for address
   */
  async getAvatar(address) {
    try {
      const ensName = await this.resolveAddress(address);
      if (!ensName) return null;

      const avatar = await this.provider.getAvatar(ensName);
      return avatar;
    } catch (error) {
      console.warn(`⚠️ Avatar resolution failed for ${address}:`, error.message);
      return null;
    }
  }

  /**
   * Check if address has ENS name
   */
  async hasENS(address) {
    const ensName = await this.resolveAddress(address);
    return !!ensName;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.reverseCache.clear();
    console.log('🧹 ENS cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      addressCache: this.cache.size,
      nameCache: this.reverseCache.size,
      totalEntries: this.cache.size + this.reverseCache.size
    };
  }

  /**
   * Format address with ENS for display in risk explanations
   */
  async formatAddressForRisk(address, context = '') {
    const ensName = await this.resolveAddress(address);
    
    if (ensName) {
      return {
        display: ensName,
        full: `${ensName} (${address})`,
        hasENS: true,
        context: context ? `${context}: ${ensName}` : ensName
      };
    }

    const shortened = `${address.slice(0, 8)}...${address.slice(-6)}`;
    return {
      display: shortened,
      full: address,
      hasENS: false,
      context: context ? `${context}: ${shortened}` : shortened
    };
  }

  /**
   * Enhanced risk explanation with ENS names
   */
  async enhanceRiskExplanation(explanation, addresses = []) {
    if (addresses.length === 0) {
      return explanation;
    }

    let enhancedExplanation = explanation;
    
    // Resolve all addresses
    const ensResults = await this.batchResolveAddresses(addresses);
    
    // Replace addresses with ENS names where available
    for (const [address, ensName] of ensResults) {
      if (ensName) {
        const addressRegex = new RegExp(address, 'gi');
        enhancedExplanation = enhancedExplanation.replace(
          addressRegex, 
          `${ensName} (${address.slice(0, 8)}...${address.slice(-4)})`
        );
      }
    }
    
    return enhancedExplanation;
  }
}

export default ENSService;