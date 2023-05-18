// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "hardhat/console.sol";
import "./GasTracker.sol";

contract TestArray is GasTracker {
    constructor(){

    }

    struct Player {
        address playerAddress;
        uint start;
        uint end;
    }

    uint private count = 0;

    mapping(uint => Player[]) private players;

    function addPlayer(Player memory player) external {

        require(players[0].length <= 1000000, "Enough is enough");

        players[0].push(player);
        count += 1;
        console.log(count);
    }

    function deletePlayers() external {
        startTracking('deletePlayers');
        delete players[0];
        printGasUsage('deletePlayers');
    }
}
