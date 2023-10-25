// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "./GasTracker.sol";

contract TestArray is GasTracker {

    uint constant private maxAmount = 1000000;
    uint32 private cycle = 1;

    struct Player {
        address playerAddress;
        uint start;
        uint end;
    }

    struct Winner {
        address addr;
        uint256 prize;
    }

    mapping(uint => Player[]) private players;
    mapping(uint => Winner[]) private winners;
    mapping(uint => uint[][]) private randoms;

    constructor(){
        for (uint256 i = 0; i < 10; i++) {
            players[cycle].push(Player({
                playerAddress: address(this),
                start: i,
                end: i + 1
            }));
        }
    }

    function addPlayer(Player[] calldata playersData) external {

        require(players[0].length <= 1000000, "Enough is enough");

        for (uint i = 0; i < playersData.length; i++) {
            players[cycle].push(playersData[i]);
        }
    }

    function binarySearch(uint target) private view returns (address) {

        uint low = 0;
        uint high = players[cycle].length - 1;
        for (uint256 i = 0; i < 20; i++) {
            uint mid = (low + high + 1) / 2;
            if (target >= players[cycle][mid].start && target <= players[cycle][mid].end) {
               //
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
             uint luckyNumber = (_randomWords[i] % maxAmount) + 1;
             address luckyPlayer = binarySearch((_randomWords[i] % maxAmount) + 1);

            //randoms[1].push(_randomWords);

            winners[1].push(Winner({
                addr: address(this),
                prize: 1000000
            }));
        }
    }
}