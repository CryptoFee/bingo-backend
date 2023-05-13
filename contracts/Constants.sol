// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Constants {
    uint constant SUBSCRIPTION_ID = 4456;
    address constant COORDINATOR = 0xAE975071Be8F8eE67addBC1A82488F1C24858067;
    bytes32 constant KEY_HASH = 0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd;

    function getSubscriptionId() public pure returns (uint) {
        return SUBSCRIPTION_ID;
    }

    function getCoordinator() public pure returns (address) {
        return COORDINATOR;
    }

    function getKeyHash() public pure returns (bytes32) {
        return KEY_HASH;
    }
}
