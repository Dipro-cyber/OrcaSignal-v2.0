// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

interface IOrcaSignalRegistry {
    function getRiskScores(address _token) 
        external 
        view 
        returns (
            uint8 holderConcentration,
            uint8 liquidityOwnership,
            uint8 governanceCapture,
            uint256 lastUpdated
        );
    
    function hasRiskData(address _token) external view returns (bool);
    function getCompositeRiskScore(address _token) external view returns (uint8);
}

/**
 * @title OrcaSignalHook
 * @dev Uniswap v4 Hook for market integrity protection using OrcaSignal risk data
 * @notice This hook blocks or warns against high-risk token swaps based on explainable risk metrics
 * @dev Simplified implementation for hackathon demo - shows core risk analysis logic
 */
contract OrcaSignalHook {
    using PoolIdLibrary for PoolKey;

    // Risk thresholds
    uint8 public constant HIGH_RISK_THRESHOLD = 70;
    uint8 public constant MEDIUM_RISK_THRESHOLD = 40;
    
    // Hook behavior modes
    enum HookMode {
        WARN_ONLY,      // Emit warnings but allow swaps
        BLOCK_HIGH,     // Block high-risk swaps, warn medium
        STRICT          // Block medium and high-risk swaps
    }
    
    HookMode public hookMode = HookMode.BLOCK_HIGH;
    IOrcaSignalRegistry public immutable orcaRegistry;
    address public owner;
    
    // Events for transparency and explainability
    event SwapBlocked(
        PoolId indexed poolId,
        address indexed token0,
        address indexed token1,
        uint8 token0Risk,
        uint8 token1Risk,
        string reason
    );
    
    event SwapWarning(
        PoolId indexed poolId,
        address indexed token0,
        address indexed token1,
        uint8 token0Risk,
        uint8 token1Risk,
        string reason
    );
    
    event RiskExplanation(
        address indexed token,
        uint8 holderConcentration,
        uint8 liquidityOwnership,
        uint8 governanceCapture,
        uint8 compositeRisk,
        string explanation
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _orcaRegistry) {
        orcaRegistry = IOrcaSignalRegistry(_orcaRegistry);
        owner = msg.sender;
    }

    /**
     * @dev Core risk analysis function - can be called before swaps
     * @param key The pool key containing the tokens to analyze
     * @return shouldBlock Whether the swap should be blocked
     * @return riskReason Human-readable explanation of the risk
     */
    function analyzeSwapRisk(PoolKey calldata key) 
        external 
        returns (bool shouldBlock, string memory riskReason) 
    {
        PoolId poolId = key.toId();
        
        // Get risk scores for both tokens
        (uint8 token0Risk, string memory token0Reason) = _getTokenRiskWithReason(Currency.unwrap(key.currency0));
        (uint8 token1Risk, string memory token1Reason) = _getTokenRiskWithReason(Currency.unwrap(key.currency1));
        
        uint8 maxRisk = token0Risk > token1Risk ? token0Risk : token1Risk;
        string memory maxRiskReason = token0Risk > token1Risk ? token0Reason : token1Reason;
        
        // Check if swap should be blocked based on hook mode
        shouldBlock = _shouldBlockSwap(maxRisk);
        riskReason = maxRiskReason;
        
        if (shouldBlock) {
            emit SwapBlocked(
                poolId,
                Currency.unwrap(key.currency0),
                Currency.unwrap(key.currency1),
                token0Risk,
                token1Risk,
                string(abi.encodePacked("High risk detected: ", maxRiskReason))
            );
        } else if (maxRisk >= MEDIUM_RISK_THRESHOLD) {
            emit SwapWarning(
                poolId,
                Currency.unwrap(key.currency0),
                Currency.unwrap(key.currency1),
                token0Risk,
                token1Risk,
                string(abi.encodePacked("Medium risk detected: ", maxRiskReason))
            );
        }
        
        return (shouldBlock, riskReason);
    }

    /**
     * @dev Simplified swap validation function
     * @param token0 First token address
     * @param token1 Second token address
     * @return shouldBlock Whether the swap should be blocked
     * @return riskReason Human-readable explanation
     */
    function validateSwap(address token0, address token1) 
        external 
        returns (bool shouldBlock, string memory riskReason) 
    {
        // Get risk scores for both tokens
        (uint8 token0Risk, string memory token0Reason) = _getTokenRiskWithReason(token0);
        (uint8 token1Risk, string memory token1Reason) = _getTokenRiskWithReason(token1);
        
        uint8 maxRisk = token0Risk > token1Risk ? token0Risk : token1Risk;
        string memory maxRiskReason = token0Risk > token1Risk ? token0Reason : token1Reason;
        
        shouldBlock = _shouldBlockSwap(maxRisk);
        riskReason = maxRiskReason;
        
        // Emit appropriate events
        if (shouldBlock) {
            emit SwapBlocked(
                PoolId.wrap(bytes32(0)), // No specific pool ID for direct validation
                token0,
                token1,
                token0Risk,
                token1Risk,
                string(abi.encodePacked("High risk detected: ", maxRiskReason))
            );
        } else if (maxRisk >= MEDIUM_RISK_THRESHOLD) {
            emit SwapWarning(
                PoolId.wrap(bytes32(0)),
                token0,
                token1,
                token0Risk,
                token1Risk,
                string(abi.encodePacked("Medium risk detected: ", maxRiskReason))
            );
        }
        
        return (shouldBlock, riskReason);
    }

    /**
     * @dev Get token risk score with human-readable reason
     */
    function _getTokenRiskWithReason(address token) internal returns (uint8 risk, string memory reason) {
        if (!orcaRegistry.hasRiskData(token)) {
            return (0, "No risk data available");
        }
        
        (uint8 holderConc, uint8 liquidityOwn, uint8 govCapture,) = orcaRegistry.getRiskScores(token);
        risk = orcaRegistry.getCompositeRiskScore(token);
        
        // Generate explainable reason
        if (holderConc >= HIGH_RISK_THRESHOLD) {
            reason = "High holder concentration risk";
        } else if (liquidityOwn >= HIGH_RISK_THRESHOLD) {
            reason = "High liquidity ownership risk";
        } else if (govCapture >= HIGH_RISK_THRESHOLD) {
            reason = "High governance capture risk";
        } else if (risk >= MEDIUM_RISK_THRESHOLD) {
            reason = "Multiple moderate risk factors";
        } else {
            reason = "Low risk profile";
        }
        
        // Emit detailed explanation
        emit RiskExplanation(
            token,
            holderConc,
            liquidityOwn,
            govCapture,
            risk,
            reason
        );
    }
    
    /**
     * @dev Determine if swap should be blocked based on risk and hook mode
     */
    function _shouldBlockSwap(uint8 riskScore) internal view returns (bool) {
        if (hookMode == HookMode.WARN_ONLY) {
            return false;
        } else if (hookMode == HookMode.BLOCK_HIGH) {
            return riskScore >= HIGH_RISK_THRESHOLD;
        } else { // STRICT mode
            return riskScore >= MEDIUM_RISK_THRESHOLD;
        }
    }
    
    /**
     * @dev Owner functions for configuration
     */
    function setHookMode(HookMode _mode) external onlyOwner {
        hookMode = _mode;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
    
    /**
     * @dev View functions for transparency
     */
    function getTokenRisk(address token) external view returns (uint8 risk, string memory reason) {
        if (!orcaRegistry.hasRiskData(token)) {
            return (0, "No risk data available");
        }
        
        (uint8 holderConc, uint8 liquidityOwn, uint8 govCapture,) = orcaRegistry.getRiskScores(token);
        risk = orcaRegistry.getCompositeRiskScore(token);
        
        // Generate explainable reason
        if (holderConc >= HIGH_RISK_THRESHOLD) {
            reason = "High holder concentration risk";
        } else if (liquidityOwn >= HIGH_RISK_THRESHOLD) {
            reason = "High liquidity ownership risk";
        } else if (govCapture >= HIGH_RISK_THRESHOLD) {
            reason = "High governance capture risk";
        } else if (risk >= MEDIUM_RISK_THRESHOLD) {
            reason = "Multiple moderate risk factors";
        } else {
            reason = "Low risk profile";
        }
    }
    
    function shouldBlockSwap(address token0, address token1) external view returns (bool shouldBlock, string memory reason) {
        (uint8 token0Risk, string memory token0Reason) = this.getTokenRisk(token0);
        (uint8 token1Risk, string memory token1Reason) = this.getTokenRisk(token1);
        
        uint8 maxRisk = token0Risk > token1Risk ? token0Risk : token1Risk;
        shouldBlock = _shouldBlockSwap(maxRisk);
        reason = token0Risk > token1Risk ? token0Reason : token1Reason;
    }

    /**
     * @dev Batch risk analysis for multiple token pairs
     */
    function batchAnalyzeRisk(address[] calldata tokens) 
        external 
        view 
        returns (uint8[] memory risks, string[] memory reasons) 
    {
        risks = new uint8[](tokens.length);
        reasons = new string[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            (risks[i], reasons[i]) = this.getTokenRisk(tokens[i]);
        }
    }

    /**
     * @dev Get hook configuration
     */
    function getHookConfig() external view returns (
        HookMode mode,
        uint8 highThreshold,
        uint8 mediumThreshold,
        address registry
    ) {
        return (hookMode, HIGH_RISK_THRESHOLD, MEDIUM_RISK_THRESHOLD, address(orcaRegistry));
    }
}