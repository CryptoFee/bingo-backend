// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import "./GasTracker.sol";

contract TestArray is GasTracker {

    uint256 constant private maxAmount = 1000000;
    uint32 private cycle = 1;

    struct Player {
        address playerAddress;
        uint256 start;
        uint256 end;
    }

    event Winners(uint256[]);

    mapping(uint256 => Player[]) private players;

    function addPlayer(Player[] calldata playersData) external {

        require(players[0].length <= 1000000, "Enough is enough");

        for (uint256 i = 0; i < playersData.length; i++) {
            players[cycle].push(playersData[i]);
        }
    }

    function binarySearch(uint256 target) private view returns (address) {
        uint256 low = 0;
        uint256 high = players[cycle].length - 1;
        while (low <= high) {
            uint256 mid = (low + high + 1) / 2;
            if (target >= players[cycle][mid].start && target <= players[cycle][mid].end) {
                return players[cycle][mid].playerAddress;
            } else if (target < players[cycle][mid].start) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return address(this);
    }


    function receivePlayersAndPickWinner(uint256[] calldata _randomWords) public {

        for (uint32 i = 0; i < _randomWords.length; i++) {
            uint256 luckyNumber = (_randomWords[i] % maxAmount) + 1;
            address luckyPlayer = binarySearch(luckyNumber);
        }
        uint256 contractBalance = address(this).balance;
        console.log(contractBalance);
        emit Winners(_randomWords);

    }
}
