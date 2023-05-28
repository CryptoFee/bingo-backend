// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./VRFv2SubscriptionConsumer.sol";
import "./NoEther.sol";
import "hardhat/console.sol";
import "./GasTracker.sol";


contract Lottery is VRFv2SubscriptionConsumer, NoEther, GasTracker {
    IERC20 private usdtToken;
    address private immutable lotteryOwner;
    uint256 private immutable maxAmount;
    uint[] private prizes;
    uint256 private requestId;
    bool private lock;
    bool private isActive = true;
    uint256 private lastPlayerMax = 0;
    uint32 private cycle = 1;
    uint32 private cycleLimit;

    struct Player {
        address playerAddress;
        uint256 start;
        uint256 end;
    }

    mapping(uint32 => Player[]) public players;

    event NewPlayer();
    event Winners(uint256[]);

    modifier onlyLotteryOwner() {
        require(msg.sender == lotteryOwner, "Only the contract owner can perform this action");
        _;
    }

    modifier nonReentrant() {
        require(!lock, "Reentrant call.");
        lock = true;
        _;
        lock = false;
    }

    modifier nonCycleLimitExceed() {
        require(cycle <= cycleLimit, "Cycle Limit Exceeded");
        _;
    }

    modifier nonDisabled() {
        require(isActive == true, "Lottery is not active");
        _;
    }

    constructor(
        address _usdtTokenAddress,
        uint256 _maxAmount,
        uint8 _cycleLimit,
        uint[] memory _prizes,
        uint64 subscriptionId,
        address coordinator,
        bytes32 keyHash
    ) VRFv2SubscriptionConsumer(subscriptionId, coordinator, keyHash) {
        lotteryOwner = msg.sender;
        usdtToken = IERC20(_usdtTokenAddress);
        prizes = _prizes;
        maxAmount = _maxAmount;
        cycleLimit = _cycleLimit;
    }

    function getLotteryDetails() external onlyLotteryOwner view returns (bool, Player[] memory, uint[] memory, uint, uint32){
        return (isActive, players[cycle], prizes, maxAmount, cycle);
    }

    function buyLotteryTickets(address player, uint256 amount) external nonReentrant nonCycleLimitExceed nonDisabled {
        require(usdtToken.transferFrom(player, address(this), amount), "USDT transfer failed.");

        players[cycle].push(Player({
            playerAddress: player,
            start: lastPlayerMax,
            end: lastPlayerMax + amount
        }));

        lastPlayerMax += amount;

        emit NewPlayer();

        if (lastPlayerMax >= maxAmount) {
            requestId = requestRandomWords(uint32(prizes.length));
            isActive = false;
        }
    }

    function resetGame() private {
        lastPlayerMax = 0;
        requestId = 0;
        cycle++;
        isActive = true;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(requestId == _requestId, "request not found!");
        transferPrizesToWinners(_randomWords);
        resetGame();
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

        return lotteryOwner;
    }

    function transferPrizesToWinners(uint256[] memory _randomWords) private {

        for (uint32 i = 0; i < _randomWords.length; i++) {
            uint256 luckyNumber = (_randomWords[i] % maxAmount) + 1;
            address luckyPlayer = binarySearch(luckyNumber);
            require(usdtToken.transfer(luckyPlayer, prizes[i]), "USDT transfer failed.");
        }

        emit Winners(_randomWords);

        uint256 contractBalance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(lotteryOwner, contractBalance), "USDT transfer to owner failed.");
    }
}
