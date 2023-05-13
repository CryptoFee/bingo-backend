// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./VRFv2SubscriptionConsumer.sol";
import "./NoEther.sol";
import "hardhat/console.sol";
import "./GasTracker.sol";

interface IERC20WithDecimal is IERC20 {
    function decimals() external view returns (uint8);
}

contract Lottery is VRFv2SubscriptionConsumer, NoEther, GasTracker {
    IERC20WithDecimal private usdtToken;
    address private immutable lotteryOwner;
    uint private immutable maxAmount;
    uint[] private prizes;
    uint private requestId;
    bool private lock;
    bool private isActive = true;
    uint private lastPlayerMax = 0;

    struct LuckyPlayer {
        address playerAddress;
        uint prize;
    }

    struct Player {
        address playerAddress;
        uint start;
        uint end;
    }

    Player[] private players;

    event NewPlayer(address player, uint amount);
    event ResetGame();
    event Winners(LuckyPlayer[]);


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

    constructor(
        address _usdtTokenAddress,
        uint _maxAmount,
        uint[] memory _prizes,
        uint64 subscriptionId,
        address coordinator,
        bytes32 keyHash
    ) VRFv2SubscriptionConsumer(subscriptionId, coordinator, keyHash) {
        lotteryOwner = msg.sender;
        usdtToken = IERC20WithDecimal(_usdtTokenAddress);
        prizes = _prizes;
        maxAmount = _maxAmount;
    }

    function getLotteryDetails() external view onlyLotteryOwner returns (bool, Player[] memory, uint[] memory, uint){
        return (isActive, players, prizes, maxAmount);
    }


    function buyLotteryTickets(address player, uint amount) external nonReentrant {
        require(isActive == true, "Winners are being calculated. Please wait");
        require(usdtToken.transferFrom(player, address(this), amount), "USDT transfer failed.");

        players.push(Player({
            playerAddress: player,
            start: lastPlayerMax,
            end: lastPlayerMax + amount
        }));

        lastPlayerMax += amount;

        emit NewPlayer(player, amount);

        if (lastPlayerMax >= maxAmount) {
            requestId = requestRandomWords(uint32(prizes.length));
            isActive = false;
        }

        console.log(lastPlayerMax);
    }

    function resetGame() private {
        lastPlayerMax = 0;
        requestId = 0;
        emit ResetGame();
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(requestId == _requestId, "request not found!");
        transferPrizesToWinners(_randomWords);
        resetGame();
    }

    function binarySearch(uint target) private view returns (address) {
        uint low = 0;
        uint high = players.length - 1;
        while (low <= high) {
            uint mid = (low + high + 1) / 2;
            if (target >= players[mid].start && target <= players[mid].end) {
                return players[mid].playerAddress;
            } else if (target < players[mid].start) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        return lotteryOwner;
    }

    function transferPrizesToWinners(uint256[] memory _randomWords) internal {
        LuckyPlayer[] memory luckyPlayers = new LuckyPlayer[](_randomWords.length);

        for (uint32 i = 0; i < _randomWords.length; i++) {
            uint32 luckyNumber = uint32((_randomWords[i] % maxAmount) + 1);
            address luckyPlayer = binarySearch(luckyNumber);
            require(usdtToken.transfer(luckyPlayer, prizes[i]), "USDT transfer failed.");
            luckyPlayers[i] = LuckyPlayer({
                playerAddress: luckyPlayer,
                prize: prizes[i]
            });
        }

        emit Winners(luckyPlayers);
        uint256 contractBalance = usdtToken.balanceOf(address(this));
        require(usdtToken.transfer(lotteryOwner, contractBalance), "USDT transfer to owner failed.");
    }
}
