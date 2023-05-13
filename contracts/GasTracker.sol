// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract GasTracker {
   mapping (string => uint ) gasLimitMap;

    function startTracking(string memory tracker) internal {
        gasLimitMap[tracker] = gasleft();
        console.log(tracker , "Gas limit: ", gasLimitMap[tracker]);
    }

    function printGasUsage(string memory tracker) internal view {
        console.log(tracker, "Gas usage: ",  gasLimitMap[tracker] - gasleft());
    }
}