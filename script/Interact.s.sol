// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console2} from "forge-std/Script.sol";
import {OrcaSignalRegistry} from "../src/OrcaSignalRegistry.sol";

contract InteractScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address registryAddress = vm.envAddress("ORCA_SIGNAL_REGISTRY_ADDRESS");
        
        console2.log("Interacting with OrcaSignal Registry at:", registryAddress);

        vm.startBroadcast(deployerPrivateKey);

        OrcaSignalRegistry registry = OrcaSignalRegistry(registryAddress);
        
        // Example: Submit risk data for USDC (Sepolia testnet)
        address usdcAddress = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
        
        console2.log("Submitting risk data for USDC:", usdcAddress);
        registry.updateRiskData(usdcAddress, 45, 32, 78);
        
        // Read back the data
        (
            uint8 holderConcentration,
            uint8 liquidityOwnership,
            uint8 governanceCapture,
            uint256 lastUpdated
        ) = registry.getRiskScores(usdcAddress);
        
        console2.log("Risk data submitted successfully:");
        console2.log("  Holder Concentration:", holderConcentration, "%");
        console2.log("  Liquidity Ownership:", liquidityOwnership, "%");
        console2.log("  Governance Capture:", governanceCapture, "%");
        console2.log("  Last Updated:", lastUpdated);
        
        uint8 compositeScore = registry.getCompositeRiskScore(usdcAddress);
        console2.log("  Composite Score:", compositeScore, "%");

        vm.stopBroadcast();
    }
}