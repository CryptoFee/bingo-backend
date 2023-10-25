// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./VRFv2SubscriptionConsumer.sol";
import "hardhat/console.sol";
import "./GasTracker.sol";

contract LotteryNew is VRFv2SubscriptionConsumer , GasTracker {

    using SafeERC20 for IERC20;

    uint256 private _currentCycle;
    uint256 private _requestId;
    bool private _isActive;
    uint256[] private _prizes;
    mapping(uint256 => address[]) private _players;
    mapping(uint256 => Winner[]) private _winners;
    uint256 private immutable _maxAmount;
    uint256 private immutable _cycleLimit;
    address public immutable lotteryOwner;
    IERC20 private immutable _usdt;
    uint256 private constant _MIN_DEPOSIT = 10 ** 6;

    struct Winner {
        address addr;
        uint256 prize;
    }

    event NewPlayer(address indexed player, uint256 amount);
    event CycleEnded();

    modifier isActive() {
        require(_isActive == true, "Lottery is not active!");
        _;
    }

    constructor(
        address usdtTokenAddress,
        uint256 maxAmount,
        uint8 cycleLimit,
        uint256[] memory prizes,
        uint64 subscriptionId,
        address coordinator,
        bytes32 keyHash
    ) VRFv2SubscriptionConsumer(subscriptionId, coordinator, keyHash) {
        require(usdtTokenAddress != address(0), "Lottery: Invalid USDT address!");
        require(maxAmount != 0, "Lottery: Zero max amount!");
        require(cycleLimit != 0, "Lottery: Zero cycle limit!");
        require(prizes.length != 0, "Lottery: Empty prizes array!");

        lotteryOwner = msg.sender;
        _usdt = IERC20(usdtTokenAddress);
        _prizes = prizes;
        _maxAmount = maxAmount;
        _cycleLimit = cycleLimit;

        // Activate participation
        _currentCycle++;
        _isActive = true;
    }

    function buyTickets(uint256 amount) external isActive {

        require(amount >= _MIN_DEPOSIT, "buyTickets: Amount is less from min deposit!");
        require(_players[_currentCycle].length + amount < _maxAmount, "Too much money.");

        _usdt.safeTransferFrom(msg.sender, address(this), amount);

        for (uint256 i = 0; i < amount / 10 ** 6; i++) {
            _players[_currentCycle].push(msg.sender);
        }

        emit NewPlayer(msg.sender, amount);

        if (_players[_currentCycle].length == _maxAmount / 10 ** 6) {
            _requestId = requestRandomWords(uint32(_prizes.length));
            _isActive = false;
        }

    }

    function getCurrentCycle() external view returns (uint256)  {
        return _currentCycle;
    }

    function getLotteryDetails(uint32 cycleNumber) external view returns (
        bool,
        address[] memory,
        Winner[] memory,
        uint[] memory,
        uint
    ){
        return (
        _isActive,
        _players[cycleNumber],
        _winners[cycleNumber],
        _prizes,
        _maxAmount
        );
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(_requestId == requestId, "fulfillRandomWords: Request IDs not match!");
        _transferPrizesToWinners(randomWords);
        _resetGame();
    }

    function _transferPrizesToWinners(uint256[] memory randomWords) private {
        for (uint256 i = 0; i < randomWords.length; i++) {
            uint256 luckyNumber = (randomWords[i] % (_maxAmount / _MIN_DEPOSIT));
            startTracking("Lucky player gas usage");
            address luckyPlayer = _players[_currentCycle][luckyNumber];
            printGasUsage("Lucky player gas usage");
            _usdt.safeTransfer(luckyPlayer, _prizes[i]);

            _winners[_currentCycle].push(Winner({
                addr: luckyPlayer,
                prize: _prizes[i]
            }));
        }

        uint256 contractBalance = _usdt.balanceOf(address(this));
        _usdt.safeTransfer(lotteryOwner, contractBalance);
    }

    function _resetGame() private {
        _requestId = 0;
        _currentCycle++;
        _isActive = _currentCycle <= _cycleLimit;
        emit CycleEnded();
    }

}
