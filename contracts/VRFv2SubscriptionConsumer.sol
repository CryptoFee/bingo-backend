// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

abstract contract VRFv2SubscriptionConsumer is VRFConsumerBaseV2 {

    VRFCoordinatorV2Interface immutable COORDINATOR;

    bytes32 immutable hashKey;
    uint64 immutable subscriptionId;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 constant callbackGasLimit = 2500000;

    // The default is 3, but you can set this higher.
    uint16 constant requestConfirmations = 10;

    constructor(
        uint64 _subscriptionId,
        address coordinator,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(coordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(coordinator);
        subscriptionId = _subscriptionId;
        hashKey = _keyHash;
    }

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords(uint32 numWords) internal returns (uint)    {
        // Will revert if subscription is not set and funded.
        uint requestId = COORDINATOR.requestRandomWords(
            hashKey,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        return requestId;
    }

    function addConsumer(address addr) internal {
        COORDINATOR.addConsumer(subscriptionId, addr);
    }
}
