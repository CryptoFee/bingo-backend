// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

abstract contract VRFv2SubscriptionConsumer is VRFConsumerBaseV2, ConfirmedOwner {

    bytes32 hashKey;

    event RequestSent(uint256 requestId, uint32 numWords);

    VRFCoordinatorV2Interface immutable COORDINATOR;

    // Your subscription ID.
    uint64 immutable subscriptionId;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 constant callbackGasLimit = 25000000;

    // The default is 3, but you can set this higher.
    uint16 constant requestConfirmations = 3;

    /**
     * HARDCODED FOR SEPOLIA
     * COORDINATOR: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
     */
    constructor(
        uint64 _subscriptionId,
        address coordinator,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(coordinator) ConfirmedOwner(msg.sender) {
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
}
