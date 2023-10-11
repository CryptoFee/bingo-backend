// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NoEther {
    function revertOnEther() internal pure {
        revert("NoEther: Contract cannot receive Ether");
    }

    fallback() external payable {
        revertOnEther();
    }

    receive() external payable {
        revertOnEther();
    }
}


