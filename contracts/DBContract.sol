// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract DBContract {
    address public _allowedAddress;
    address private _owner;
    mapping(uint256 => address[]) private _players;

    constructor () {
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only the Owner can call this function");
        _;
    }

    modifier onlyAllowedAddress() {
        require(msg.sender == _allowedAddress, "Only the allowed address can call this function");
        _;
    }

    function setAllowedAddress(address allowedAddress) external onlyOwner {
        require(_allowedAddress == address(0), "Allowed address already set");
        _allowedAddress = allowedAddress;
    }

    function getWinnerByIndexAndCycle(uint256 index, uint256 cycle) external view returns (address)  {
        return _players[cycle][index];
    }

    function setPlayerByCycle(uint256 cycle, address playerAddress) external onlyAllowedAddress {
        _players[cycle].push(playerAddress);
    }

    function getPlayersCount(uint256 cycle) external view returns (uint256)  {
        return _players[cycle].length;
    }
}
