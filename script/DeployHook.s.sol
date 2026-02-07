// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {OrcaSignalHook} from "../src/OrcaSignalHook.sol";

contract DeployHookScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address orcaRegistry = vm.envAddress("ORCA_REGISTRY_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy OrcaSignal Hook
        OrcaSignalHook hook = new OrcaSignalHook(orcaRegistry);
        
        console.log("OrcaSignal Hook deployed to:", address(hook));
        console.log("Connected to OrcaSignal Registry:", orcaRegistry);
        
        // Test the hook functionality
        console.log("Hook configuration:");
        (
            OrcaSignalHook.HookMode mode,
            uint8 highThreshold,
            uint8 mediumThreshold,
            address registry
        ) = hook.getHookConfig();
        
        console.log("- Mode:", uint8(mode));
        console.log("- High Risk Threshold:", highThreshold);
        console.log("- Medium Risk Threshold:", mediumThreshold);
        console.log("- Registry Address:", registry);
        
        vm.stopBroadcast();
        
        // Write deployment info to file
        string memory deploymentInfo = string(abi.encodePacked(
            '{\n',
            '  "orcaSignalHook": "', vm.toString(address(hook)), '",\n',
            '  "orcaRegistry": "', vm.toString(orcaRegistry), '",\n',
            '  "network": "sepolia",\n',
            '  "timestamp": "', vm.toString(block.timestamp), '"\n',
            '}'
        ));
        
        vm.writeFile("hook-deployment.json", deploymentInfo);
        console.log("Deployment info written to hook-deployment.json");
    }
}