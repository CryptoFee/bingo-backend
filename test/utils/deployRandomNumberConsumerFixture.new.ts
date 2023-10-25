import {ethers, network} from "hardhat";
import {getArguments} from "./helpers";

const {networkConfig} = require("../../hardhat.config.test");

interface ICRNCFDeploy {
    dbContractAddresses: string[],
    maxRowsCountEachDbContract: number
}

export const createRandomNumberConsumerFixtureDeploy = ({dbContractAddresses, maxRowsCountEachDbContract}: ICRNCFDeploy) => {

    const {maxAmount, prizes, cycles} = getArguments()

    return async function deployRandomNumberConsumerFixture() {
        const [deployer] = await ethers.getSigners()

        const BASE_FEE = "10000"
        const GAS_PRICE_LINK = "100" // 0.000000001 LINK per gas

        const chainId = network.config.chainId || 0

        const VRFCoordinatorV2MockFactory = await ethers.getContractFactory(
            "VRFCoordinatorV2Mock"
        )

        const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(
            BASE_FEE,
            GAS_PRICE_LINK
        )

        const fundAmount = networkConfig[chainId]["fundAmount"] || "1000000000000000000"
        const transaction = await VRFCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transaction.wait(1)
        const subscriptionId = ethers.BigNumber.from(transactionReceipt?.events?.[0].topics[1])
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, fundAmount)

        const vrfCoordinatorAddress = VRFCoordinatorV2Mock.address
        const keyHash =
            networkConfig[chainId]["keyHash"] ||
            "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"

        const MockUSDTFactory = await ethers.getContractFactory("USDT")

        const MockUSDT = await MockUSDTFactory.connect(deployer).deploy()

        const LotteryFactory = await ethers.getContractFactory("LotteryNew")

        const Lottery = await LotteryFactory
            .connect(deployer)
            .deploy(
                MockUSDT.address,
                maxAmount * 1000000,
                cycles,
                prizes,
                subscriptionId,
                vrfCoordinatorAddress,
                keyHash,
                dbContractAddresses,
                maxRowsCountEachDbContract
            )

        await VRFCoordinatorV2Mock.addConsumer(subscriptionId, Lottery.address)

        return {Lottery, MockUSDT, VRFCoordinatorV2Mock, deployer}
    }
}