// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title OrcaSignalRegistry
 * @dev Registry contract for storing DeFi risk intelligence data
 * @notice Stores risk scores for tokens focusing on capital concentration and governance capture
 */
contract OrcaSignalRegistry {
    struct RiskData {
        uint8 holderConcentration;    // 0-100: Top holder concentration risk
        uint8 liquidityOwnership;     // 0-100: LP token ownership concentration  
        uint8 governanceCapture;      // 0-100: Governance voting power concentration
        uint256 lastUpdated;          // Timestamp of last update
        address updater;              // Address that submitted the data
    }

    // Token address => Risk data
    mapping(address => RiskData) public riskRegistry;
    
    // Authorized updaters (can be expanded to multiple analyzers)
    mapping(address => bool) public authorizedUpdaters;
    
    address public owner;
    
    // Events
    event RiskDataUpdated(
        address indexed token,
        uint8 holderConcentration,
        uint8 liquidityOwnership, 
        uint8 governanceCapture,
        address indexed updater,
        uint256 timestamp
    );
    
    event UpdaterAuthorized(address indexed updater, bool authorized);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender], "Not authorized to update risk data");
        _;
    }
    
    modifier validScores(uint8 _holder, uint8 _liquidity, uint8 _governance) {
        require(_holder <= 100, "Holder concentration must be 0-100");
        require(_liquidity <= 100, "Liquidity ownership must be 0-100"); 
        require(_governance <= 100, "Governance capture must be 0-100");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @dev Update risk data for a token
     * @param _token Token contract address
     * @param _holderConcentration Holder concentration risk score (0-100)
     * @param _liquidityOwnership Liquidity ownership risk score (0-100)
     * @param _governanceCapture Governance capture risk score (0-100)
     */
    function updateRiskData(
        address _token,
        uint8 _holderConcentration,
        uint8 _liquidityOwnership,
        uint8 _governanceCapture
    ) 
        external 
        onlyAuthorized 
        validScores(_holderConcentration, _liquidityOwnership, _governanceCapture)
    {
        require(_token != address(0), "Invalid token address");
        
        riskRegistry[_token] = RiskData({
            holderConcentration: _holderConcentration,
            liquidityOwnership: _liquidityOwnership,
            governanceCapture: _governanceCapture,
            lastUpdated: block.timestamp,
            updater: msg.sender
        });
        
        emit RiskDataUpdated(
            _token,
            _holderConcentration,
            _liquidityOwnership,
            _governanceCapture,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Get risk data for a token
     * @param _token Token contract address
     * @return Risk data struct
     */
    function getRiskData(address _token) external view returns (RiskData memory) {
        return riskRegistry[_token];
    }
    
    /**
     * @dev Get individual risk scores for a token
     * @param _token Token contract address
     * @return holderConcentration Holder concentration score
     * @return liquidityOwnership Liquidity ownership score  
     * @return governanceCapture Governance capture score
     * @return lastUpdated Last update timestamp
     */
    function getRiskScores(address _token) 
        external 
        view 
        returns (
            uint8 holderConcentration,
            uint8 liquidityOwnership,
            uint8 governanceCapture,
            uint256 lastUpdated
        ) 
    {
        RiskData memory data = riskRegistry[_token];
        return (
            data.holderConcentration,
            data.liquidityOwnership,
            data.governanceCapture,
            data.lastUpdated
        );
    }
    
    /**
     * @dev Check if risk data exists for a token
     * @param _token Token contract address
     * @return exists Whether risk data exists
     */
    function hasRiskData(address _token) external view returns (bool exists) {
        return riskRegistry[_token].lastUpdated > 0;
    }
    
    /**
     * @dev Get composite risk score (average of all risk factors)
     * @param _token Token contract address
     * @return compositeScore Average risk score (0-100)
     */
    function getCompositeRiskScore(address _token) external view returns (uint8 compositeScore) {
        RiskData memory data = riskRegistry[_token];
        if (data.lastUpdated == 0) return 0;
        
        return uint8((uint256(data.holderConcentration) + 
                     uint256(data.liquidityOwnership) + 
                     uint256(data.governanceCapture)) / 3);
    }

    /**
     * @dev Authorize or deauthorize an updater
     * @param _updater Address to authorize/deauthorize
     * @param _authorized Whether to authorize or deauthorize
     */
    function setAuthorizedUpdater(address _updater, bool _authorized) external onlyOwner {
        require(_updater != address(0), "Invalid updater address");
        authorizedUpdaters[_updater] = _authorized;
        emit UpdaterAuthorized(_updater, _authorized);
    }
    
    /**
     * @dev Transfer ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner address");
        owner = _newOwner;
    }
    
    /**
     * @dev Get data freshness (seconds since last update)
     * @param _token Token contract address
     * @return age Seconds since last update (0 if never updated)
     */
    function getDataAge(address _token) external view returns (uint256 age) {
        uint256 lastUpdate = riskRegistry[_token].lastUpdated;
        if (lastUpdate == 0) return 0;
        return block.timestamp - lastUpdate;
    }
}