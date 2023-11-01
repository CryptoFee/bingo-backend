// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./VRFv2SubscriptionConsumer.sol";
import "./DBContract.sol";

contract Lottery is VRFv2SubscriptionConsumer {

    using SafeERC20 for IERC20;

    uint256 private _currentCycle;
    uint256 private _playersCount;
    uint256 private _maxRowsCountEachDbContract;
    address[] private _dbContractAddresses;
    uint256 private _requestId;
    bool private _isActive;
    uint256[] private _prizes;
    mapping(address => DBContract) private _DBContracts;
    uint256 private immutable _maxAmount;
    uint256 private immutable _cycleLimit;
    address public immutable lotteryOwner;
    IERC20 private immutable _usdt;
    uint256 private constant _MIN_DEPOSIT = 10 ** 6;

    event NewPlayer(address indexed player, uint256 indexed cycle, uint256 amount);
    event FullFillRandomWords(uint256 indexed cycle, uint256[] randomWords);
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
        bytes32 keyHash,
        address[] memory dbContractAddresses,
        uint256 maxRowsCountEachDbContract
    ) VRFv2SubscriptionConsumer(subscriptionId, coordinator, keyHash) {
        require(usdtTokenAddress != address(0), "Lottery: Invalid USDT address!");
        require(maxAmount != 0, "Lottery: Zero max amount!");
        require(cycleLimit != 0, "Lottery: Zero cycle limit!");
        require(prizes.length != 0, "Lottery: Empty prizes array!");
        _dbContractAddresses = dbContractAddresses;

        for (uint256 i = 0; i < dbContractAddresses.length; i++) {
            _DBContracts[dbContractAddresses[i]] = DBContract(dbContractAddresses[i]);
        }

        _maxRowsCountEachDbContract = maxRowsCountEachDbContract;
        lotteryOwner = msg.sender;
        _usdt = IERC20(usdtTokenAddress);
        _prizes = prizes;
        _maxAmount = maxAmount;
        _cycleLimit = cycleLimit;
        _playersCount = 0;

        // Activate participation
        _currentCycle++;
        _isActive = true;
    }

    function buyTickets(uint256 amount) external isActive {

        require(amount >= _MIN_DEPOSIT, "buyTickets: Amount is less from min deposit!");
        require(_playersCount + amount < _maxAmount, "Too much money.");

        _usdt.safeTransferFrom(msg.sender, address(this), amount);

        for (uint256 i = 0; i < amount / _MIN_DEPOSIT; i++) {
            uint256 currentIndex = (_playersCount / _maxRowsCountEachDbContract);
            address currentIndexAddress = _dbContractAddresses[currentIndex];
            if (_DBContracts[currentIndexAddress].getPlayersCount(_currentCycle) == _maxRowsCountEachDbContract) {
                currentIndex++;
            }
            _DBContracts[currentIndexAddress].setPlayerByCycle(_currentCycle, msg.sender);
            _playersCount++;
        }

        emit NewPlayer(msg.sender, _currentCycle, amount);

        if (_playersCount == _maxAmount / _MIN_DEPOSIT) {
            _requestId = requestRandomWords(uint32(_prizes.length));
            _isActive = false;
        }

    }

    function getCurrentCycle() external view returns (uint256)  {
        return _currentCycle;
    }

    function getLotteryDetails() external view returns (
        bool,
        address[] memory,
        uint[] memory,
        uint
    ){
        return (
            _isActive,
            _dbContractAddresses,
            _prizes,
            _maxAmount
        );
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(_requestId == requestId, "fulfillRandomWords: Request IDs not match!");
        _transferPrizesToWinners(randomWords);
        emit FullFillRandomWords(_currentCycle, randomWords);
        _resetGame();
    }

    function _transferPrizesToWinners(uint256[] memory randomWords) private {
        for (uint256 i = 0; i < randomWords.length; i++) {
            uint256 luckyNumber = randomWords[i] % (_maxAmount / _MIN_DEPOSIT);
            uint256 currentContractIndex = luckyNumber / _maxRowsCountEachDbContract;
            address currentContractIndexAddress = _dbContractAddresses[currentContractIndex];
            uint256 currentUserIndex = luckyNumber - (currentContractIndex * _maxRowsCountEachDbContract);
            address luckyPlayer = _DBContracts[currentContractIndexAddress].getWinnerByIndexAndCycle(currentUserIndex, _currentCycle);
            _usdt.safeTransfer(luckyPlayer, _prizes[i]);
        }

        uint256 contractBalance = _usdt.balanceOf(address(this));
        _usdt.safeTransfer(lotteryOwner, contractBalance);
    }

    function _resetGame() private {
        _requestId = 0;
        _playersCount = 0;
        _currentCycle++;
        _isActive = _currentCycle <= _cycleLimit;
        emit CycleEnded();
    }

}
