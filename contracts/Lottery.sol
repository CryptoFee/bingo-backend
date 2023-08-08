// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./VRFv2SubscriptionConsumer.sol";

contract Lottery is VRFv2SubscriptionConsumer {

    using SafeERC20 for IERC20;

    uint256 private _currentCycle;
    uint256 private _requestId;
    uint256 private _lastPlayerMax;
    bool private _isActive;
    uint256[] private _prizes;
    mapping(uint256 => Player[]) private _players;
    uint256 private immutable _maxAmount;
    uint256 private immutable _cycleLimit;
    address public immutable lotteryOwner;
    IERC20 private immutable _usdt;
    uint256 private constant _MIN_DEPOSIT = 10 ** 6;

    struct Player {
        address addr;
        uint256 start;
        uint256 end;
    }

    event NewPlayer(address indexed player, uint256 amount, uint256 newLastPlayerMax);
    event Winner(address indexed player, uint256 amount, uint256 cycle);
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
        uint256 newLastPlayerMax = _lastPlayerMax + amount;
        require(amount >= _MIN_DEPOSIT, "buyTickets: Amount is less from min deposit!");

        _usdt.safeTransferFrom(msg.sender, address(this), amount);
        _players[_currentCycle].push(Player({
            addr: msg.sender,
            start: _lastPlayerMax,
            end: newLastPlayerMax
        }));
        _lastPlayerMax = newLastPlayerMax;

        emit NewPlayer(msg.sender, amount, _lastPlayerMax);

        if (_lastPlayerMax >= _maxAmount) {
            _requestId = requestRandomWords(uint32(_prizes.length));
            _isActive = false;
        }
    }

    function getCurrentCycle() external view returns (uint256)  {
        return _currentCycle;
    }

    function getLotteryDetails(uint32 cycleNumber) external view returns (
        bool,
        Player[] memory,
        uint[] memory,
        uint
    ){
        return (
            _isActive,
            _players[cycleNumber],
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
            uint256 luckyNumber = (randomWords[i] % (_maxAmount / 10 ** 6 )) + 1;
            address luckyPlayer = _binarySearch(luckyNumber);
            _usdt.safeTransfer(luckyPlayer, _prizes[i]);
            emit Winner(luckyPlayer, _prizes[i], _currentCycle);
        }

        uint256 contractBalance = _usdt.balanceOf(address(this));
        _usdt.safeTransfer(lotteryOwner, contractBalance);
    }

    function _binarySearch(uint256 target) private view returns (address) {
        Player[] storage players = _players[_currentCycle];
        uint256 low = 0;
        uint256 high = players.length - 1;

        while (low <= high) {
            uint256 mid = low + (high - low) / 2;
            Player storage player = players[mid];

            if (target >= player.start / 10 ** 6 && target <= player.end / 10 ** 6) {
                return player.addr;
            } else if (target < player.start / 10 ** 6 ) {
                if (mid == 0) break;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return lotteryOwner;
    }

    function _resetGame() private {
        _requestId = 0;
        _lastPlayerMax = 0;
        _currentCycle++;
        _isActive = _currentCycle <= _cycleLimit;
        emit CycleEnded();
    }

}
