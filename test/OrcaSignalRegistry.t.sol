// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {OrcaSignalRegistry} from "../src/OrcaSignalRegistry.sol";

contract OrcaSignalRegistryTest is Test {
    OrcaSignalRegistry public registry;
    
    address public owner;
    address public addr1;
    address public addr2;
    address public tokenAddress;
    
    event RiskDataUpdated(
        address indexed token,
        uint8 holderConcentration,
        uint8 liquidityOwnership,
        uint8 governanceCapture,
        address indexed updater,
        uint256 timestamp
    );
    
    event UpdaterAuthorized(address indexed updater, bool authorized);

    function setUp() public {
        owner = address(this);
        addr1 = makeAddr("addr1");
        addr2 = makeAddr("addr2");
        tokenAddress = makeAddr("token");
        
        registry = new OrcaSignalRegistry();
    }

    function test_Deployment() public {
        assertEq(registry.owner(), owner);
        assertTrue(registry.authorizedUpdaters(owner));
    }

    function test_UpdateRiskData() public {
        registry.updateRiskData(tokenAddress, 50, 60, 70);
        
        (
            uint8 holderConcentration,
            uint8 liquidityOwnership,
            uint8 governanceCapture,
            uint256 lastUpdated
        ) = registry.getRiskScores(tokenAddress);
        
        assertEq(holderConcentration, 50);
        assertEq(liquidityOwnership, 60);
        assertEq(governanceCapture, 70);
        assertGt(lastUpdated, 0);
    }

    function test_UpdateRiskDataEmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit RiskDataUpdated(tokenAddress, 50, 60, 70, owner, block.timestamp);
        
        registry.updateRiskData(tokenAddress, 50, 60, 70);
    }

    function test_RevertWhen_InvalidScores() public {
        vm.expectRevert("Holder concentration must be 0-100");
        registry.updateRiskData(tokenAddress, 101, 60, 70);
        
        vm.expectRevert("Liquidity ownership must be 0-100");
        registry.updateRiskData(tokenAddress, 50, 101, 70);
        
        vm.expectRevert("Governance capture must be 0-100");
        registry.updateRiskData(tokenAddress, 50, 60, 101);
    }

    function test_RevertWhen_ZeroAddress() public {
        vm.expectRevert("Invalid token address");
        registry.updateRiskData(address(0), 50, 60, 70);
    }

    function test_RevertWhen_UnauthorizedUpdater() public {
        vm.prank(addr1);
        vm.expectRevert("Not authorized to update risk data");
        registry.updateRiskData(tokenAddress, 50, 60, 70);
    }

    function test_GetRiskData() public {
        registry.updateRiskData(tokenAddress, 30, 40, 50);
        
        OrcaSignalRegistry.RiskData memory riskData = registry.getRiskData(tokenAddress);
        
        assertEq(riskData.holderConcentration, 30);
        assertEq(riskData.liquidityOwnership, 40);
        assertEq(riskData.governanceCapture, 50);
        assertEq(riskData.updater, owner);
        assertGt(riskData.lastUpdated, 0);
    }

    function test_GetCompositeRiskScore() public {
        registry.updateRiskData(tokenAddress, 30, 40, 50);
        
        uint8 compositeScore = registry.getCompositeRiskScore(tokenAddress);
        assertEq(compositeScore, 40); // (30 + 40 + 50) / 3 = 40
    }

    function test_HasRiskData() public {
        assertFalse(registry.hasRiskData(tokenAddress));
        
        registry.updateRiskData(tokenAddress, 50, 60, 70);
        
        assertTrue(registry.hasRiskData(tokenAddress));
    }

    function test_GetDataAge() public {
        registry.updateRiskData(tokenAddress, 50, 60, 70);
        
        uint256 age = registry.getDataAge(tokenAddress);
        assertEq(age, 0); // Should be 0 immediately after update
        
        vm.warp(block.timestamp + 100);
        age = registry.getDataAge(tokenAddress);
        assertEq(age, 100);
    }

    function test_SetAuthorizedUpdater() public {
        assertFalse(registry.authorizedUpdaters(addr1));
        
        vm.expectEmit(true, false, false, true);
        emit UpdaterAuthorized(addr1, true);
        
        registry.setAuthorizedUpdater(addr1, true);
        assertTrue(registry.authorizedUpdaters(addr1));
        
        // Test that authorized updater can update data
        vm.prank(addr1);
        registry.updateRiskData(tokenAddress, 80, 90, 100);
        
        OrcaSignalRegistry.RiskData memory riskData = registry.getRiskData(tokenAddress);
        assertEq(riskData.updater, addr1);
    }

    function test_DeauthorizeUpdater() public {
        registry.setAuthorizedUpdater(addr1, true);
        registry.setAuthorizedUpdater(addr1, false);
        
        assertFalse(registry.authorizedUpdaters(addr1));
        
        vm.prank(addr1);
        vm.expectRevert("Not authorized to update risk data");
        registry.updateRiskData(tokenAddress, 50, 60, 70);
    }

    function test_RevertWhen_NonOwnerAuthorization() public {
        vm.prank(addr1);
        vm.expectRevert("Only owner can call this function");
        registry.setAuthorizedUpdater(addr2, true);
    }

    function test_TransferOwnership() public {
        registry.transferOwnership(addr1);
        assertEq(registry.owner(), addr1);
    }

    function test_RevertWhen_TransferToZeroAddress() public {
        vm.expectRevert("Invalid new owner address");
        registry.transferOwnership(address(0));
    }

    function test_RevertWhen_NonOwnerTransfer() public {
        vm.prank(addr1);
        vm.expectRevert("Only owner can call this function");
        registry.transferOwnership(addr2);
    }

    // Fuzz testing
    function testFuzz_UpdateRiskData(uint8 holder, uint8 liquidity, uint8 governance) public {
        vm.assume(holder <= 100 && liquidity <= 100 && governance <= 100);
        
        registry.updateRiskData(tokenAddress, holder, liquidity, governance);
        
        (
            uint8 storedHolder,
            uint8 storedLiquidity,
            uint8 storedGovernance,
        ) = registry.getRiskScores(tokenAddress);
        
        assertEq(storedHolder, holder);
        assertEq(storedLiquidity, liquidity);
        assertEq(storedGovernance, governance);
    }

    function testFuzz_CompositeScore(uint8 holder, uint8 liquidity, uint8 governance) public {
        vm.assume(holder <= 100 && liquidity <= 100 && governance <= 100);
        
        registry.updateRiskData(tokenAddress, holder, liquidity, governance);
        
        uint8 expectedComposite = uint8((uint256(holder) + uint256(liquidity) + uint256(governance)) / 3);
        uint8 actualComposite = registry.getCompositeRiskScore(tokenAddress);
        
        assertEq(actualComposite, expectedComposite);
    }

    // Invariant: Risk scores should always be <= 100
    function invariant_RiskScoresWithinBounds() public {
        if (registry.hasRiskData(tokenAddress)) {
            (
                uint8 holder,
                uint8 liquidity,
                uint8 governance,
            ) = registry.getRiskScores(tokenAddress);
            
            assertLe(holder, 100);
            assertLe(liquidity, 100);
            assertLe(governance, 100);
        }
    }

    // Gas optimization test
    function test_GasOptimization_MultipleUpdates() public {
        uint256 gasBefore = gasleft();
        
        for (uint i = 0; i < 10; i++) {
            address token = makeAddr(string(abi.encodePacked("token", i)));
            registry.updateRiskData(token, 50, 60, 70);
        }
        
        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas used for 10 updates:", gasUsed);
        
        // Should be reasonable gas usage
        assertLt(gasUsed, 1000000); // Less than 1M gas for 10 updates
    }
}