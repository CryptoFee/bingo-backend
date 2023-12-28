import hre, {ethers} from "hardhat";
import {replaceAbi, replaceConstantsValue, replaceENV} from "./helpers/replace";

async function main() {
    const BASE_FEE = "10000"
    const GAS_PRICE_LINK = "100" // 0.000000001 LINK per gas

    const VRFCoordinatorV2MockFactory = await hre.ethers.getContractFactory(
        "VRFCoordinatorV2Mock"
    )

    const VRFCoordinatorV2Mock = await VRFCoordinatorV2MockFactory.deploy(
        BASE_FEE,
        GAS_PRICE_LINK
    )

    console.log("VRFCoordinatorV2Mock address is ", VRFCoordinatorV2Mock.address)

    const fundAmount = "1000000000000000000"
    const transaction = await VRFCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transaction.wait(1)
    const subscriptionId = ethers.BigNumber.from(transactionReceipt?.events?.[0].topics[1])
    await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, fundAmount)

    replaceAbi(`VRFCoordinatorV2Mock`)
    replaceENV(`COORDINATOR`,  VRFCoordinatorV2Mock.address)
    replaceENV(`SUB_ID`,  subscriptionId.toString())
    replaceConstantsValue(`VRFCoordinatorV2MockAddress`, VRFCoordinatorV2Mock.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
