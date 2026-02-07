// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console2} from "forge-std/Script.sol";
import {OrcaSignalRegistry} from "../src/OrcaSignalRegistry.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("Deploying OrcaSignal Registry...");
        console2.log("Deploying with account:", deployer);
        console2.log("Account balance:", deployer.balance / 1e18, "ETH");

        vm.startBroadcast(deployerPrivateKey);

        OrcaSignalRegistry registry = new OrcaSignalRegistry();

        vm.stopBroadcast();

        console2.log("OrcaSignalRegistry deployed to:", address(registry));
        console2.log("Contract owner:", registry.owner());
        console2.log("Deployer is owner:", registry.owner() == deployer);
        
        // Save deployment info
        string memory deploymentInfo = string(
            abi.encodePacked(
                "{\n",
                '  "network": "', getChainName(), '",\n',
                '  "contractAddress": "', vm.toString(address(registry)), '",\n',
                '  "deployer": "', vm.toString(deployer), '",\n',
                '  "blockNumber": ', vm.toString(block.number), ',\n',
                '  "timestamp": ', vm.toString(block.timestamp), '\n',
                "}"
            )
        );
        
        vm.writeFile("deployment.json", deploymentInfo);
        
        console2.log("\nNext Steps:");
        console2.log("1. Update backend/.env with ORCA_SIGNAL_REGISTRY_ADDRESS=", address(registry));
        console2.log("2. Verify contract:");
        console2.log("   forge verify-contract", address(registry), "src/OrcaSignalRegistry.sol:OrcaSignalRegistry --chain", getChainName());
        console2.log("3. Start the backend server: npm run backend");
        console2.log("4. Start the frontend: npm run frontend");
    }
    
    function getChainName() internal view returns (string memory) {
        uint256 chainId = block.chainid;
        if (chainId == 1) return "mainnet";
        if (chainId == 11155111) return "sepolia";
        if (chainId == 137) return "polygon";
        if (chainId == 80001) return "mumbai";
        if (chainId == 31337) return "anvil";
        return "unknown";
    }
}