// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract USDT is ERC20 {

    constructor() ERC20("Mock Tether USD", "USDT") {
        _mint(msg.sender, 1000000000 * (10 ** uint256(decimals())));

    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
