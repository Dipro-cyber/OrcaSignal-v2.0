// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./OrcaSignalRegistry.sol";

/**
 * @title YellowSessionManager
 * @dev Manages off-chain sessions and on-chain settlements for OrcaSignal
 * @notice Enables gasless risk exploration with final state settlement
 */
contract YellowSessionManager {
    struct Session {
        address user;
        uint256 startTime;
        uint256 lastActivity;
        bool isActive;
        uint256 actionsCount;
        bytes32 stateHash;
    }
    
    struct SessionAction {
        uint8 actionType; // 1=view, 2=acknowledge, 3=threshold_set
        address tokenAddress;
        uint256 timestamp;
        bytes data;
    }
    
    OrcaSignalRegistry public immutable orcaRegistry;
    
    mapping(bytes32 => Session) public sessions;
    mapping(bytes32 => SessionAction[]) public sessionActions;
    mapping(address => bytes32) public userActiveSession;
    
    uint256 public constant SESSION_TIMEOUT = 1 hours;
    uint256 public constant MAX_ACTIONS_PER_SESSION = 100;
    
    event SessionStarted(bytes32 indexed sessionId, address indexed user);
    event ActionExecuted(bytes32 indexed sessionId, uint8 actionType, address tokenAddress);
    event SessionSettled(bytes32 indexed sessionId, address indexed user, uint256 actionsCount);
    event RiskAcknowledged(bytes32 indexed sessionId, address indexed token, uint8 riskLevel);
    
    constructor(address _orcaRegistry) {
        orcaRegistry = OrcaSignalRegistry(_orcaRegistry);
    }
    
    /**
     * @dev Start a new Yellow Network session for gasless interactions
     */
    function startSession() external returns (bytes32 sessionId) {
        // End any existing active session
        bytes32 existingSession = userActiveSession[msg.sender];
        if (existingSession != bytes32(0) && sessions[existingSession].isActive) {
            _endSession(existingSession);
        }
        
        sessionId = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.prevrandao));
        
        sessions[sessionId] = Session({
            user: msg.sender,
            startTime: block.timestamp,
            lastActivity: block.timestamp,
            isActive: true,
            actionsCount: 0,
            stateHash: bytes32(0)
        });
        
        userActiveSession[msg.sender] = sessionId;
        
        emit SessionStarted(sessionId, msg.sender);
    }
    
    /**
     * @dev Record off-chain action in session (called by Yellow Network)
     */
    function recordAction(
        bytes32 sessionId,
        uint8 actionType,
        address tokenAddress,
        bytes calldata data
    ) external {
        Session storage session = sessions[sessionId];
        require(session.isActive, "Session not active");
        require(session.user == msg.sender, "Not session owner");
        require(block.timestamp <= session.lastActivity + SESSION_TIMEOUT, "Session expired");
        require(session.actionsCount < MAX_ACTIONS_PER_SESSION, "Session action limit reached");
        
        sessionActions[sessionId].push(SessionAction({
            actionType: actionType,
            tokenAddress: tokenAddress,
            timestamp: block.timestamp,
            data: data
        }));
        
        session.actionsCount++;
        session.lastActivity = block.timestamp;
        
        emit ActionExecuted(sessionId, actionType, tokenAddress);
        
        // Handle specific action types
        if (actionType == 2) { // Risk acknowledgment
            _handleRiskAcknowledgment(sessionId, tokenAddress);
        }
    }
    
    /**
     * @dev Handle risk acknowledgment action
     */
    function _handleRiskAcknowledgment(bytes32 sessionId, address tokenAddress) internal {
        if (orcaRegistry.hasRiskData(tokenAddress)) {
            uint8 riskLevel = orcaRegistry.getCompositeRiskScore(tokenAddress);
            emit RiskAcknowledged(sessionId, tokenAddress, riskLevel);
        }
    }
    
    /**
     * @dev Settle session state on-chain (final commitment)
     */
    function settleSession(bytes32 sessionId, bytes32 finalStateHash) external {
        Session storage session = sessions[sessionId];
        require(session.isActive, "Session not active");
        require(session.user == msg.sender, "Not session owner");
        
        // Update final state
        session.stateHash = finalStateHash;
        session.isActive = false;
        
        // Clear active session mapping
        userActiveSession[msg.sender] = bytes32(0);
        
        emit SessionSettled(sessionId, msg.sender, session.actionsCount);
    }
    
    /**
     * @dev End session (timeout or manual)
     */
    function _endSession(bytes32 sessionId) internal {
        Session storage session = sessions[sessionId];
        session.isActive = false;
        userActiveSession[session.user] = bytes32(0);
    }
    
    /**
     * @dev Get session details
     */
    function getSession(bytes32 sessionId) 
        external 
        view 
        returns (
            address user,
            uint256 startTime,
            uint256 lastActivity,
            bool isActive,
            uint256 actionsCount,
            bytes32 stateHash
        ) 
    {
        Session memory session = sessions[sessionId];
        return (
            session.user,
            session.startTime,
            session.lastActivity,
            session.isActive,
            session.actionsCount,
            session.stateHash
        );
    }
    
    /**
     * @dev Get session actions
     */
    function getSessionActions(bytes32 sessionId) 
        external 
        view 
        returns (SessionAction[] memory) 
    {
        return sessionActions[sessionId];
    }
    
    /**
     * @dev Check if session is valid and active
     */
    function isSessionValid(bytes32 sessionId) external view returns (bool) {
        Session memory session = sessions[sessionId];
        return session.isActive && 
               block.timestamp <= session.lastActivity + SESSION_TIMEOUT &&
               session.actionsCount < MAX_ACTIONS_PER_SESSION;
    }
    
    /**
     * @dev Get user's active session
     */
    function getUserActiveSession(address user) external view returns (bytes32) {
        return userActiveSession[user];
    }
    
    /**
     * @dev Emergency session cleanup (for expired sessions)
     */
    function cleanupExpiredSession(bytes32 sessionId) external {
        Session storage session = sessions[sessionId];
        require(session.isActive, "Session not active");
        require(block.timestamp > session.lastActivity + SESSION_TIMEOUT, "Session not expired");
        
        _endSession(sessionId);
    }
}