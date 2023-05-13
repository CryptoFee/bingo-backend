import hre from "hardhat";
import {deployCoordinator} from "./deployCordinator";
import {replaceAbi, replaceConstantsValue} from "./replace";
import {transferUSDTToLottery} from "./transferUSDTToLottery";

export const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"

async function main() {

    const [deployer] = await hre.ethers.getSigners()

    const {VRFCoordinatorV2Mock, subId} = await deployCoordinator()
    const MockUSDT = await hre.ethers.getContractFactory("USDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    replaceAbi(`USDT`)
    replaceConstantsValue(`USDTContractAddress`, mockUSDT.address)

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(
        mockUSDT.address,
        100000 * 1000000,
        [3,2,1],
        subId,
        VRFCoordinatorV2Mock.address,
        keyHash
    );

    await lottery.deployed();

    await VRFCoordinatorV2Mock.addConsumer(subId, lottery.address)

    console.log("USDTReceiver deployed to:", lottery.address);

    replaceAbi(`Lottery`)
    replaceConstantsValue(`MainContractAddress`, lottery.address)

    await transferUSDTToLottery(mockUSDT, lottery, deployer, [100, 1000], 100)


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}