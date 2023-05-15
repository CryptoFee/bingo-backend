import hre, {ethers} from "hardhat";
import {deployCoordinator} from "./deployCordinator";
import {replaceAbi, replaceConstantsValue} from "./replace";
import {transferUSDTToLottery} from "./transferUSDTToLottery";
import {dollar} from "../test/utils/helpers";

export const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"

async function main() {

    const [deployer, ...otherAccounts] = await hre.ethers.getSigners()

    const MaticToken = await hre.ethers.getContractFactory("MaticToken");
    const maticToken = await MaticToken.deploy();
    await maticToken.deployed();

    replaceAbi(`MaticToken`)
    replaceConstantsValue(`MaticTokenContractAddress`, maticToken.address)

    console.log("MATIC Token deployed to:", maticToken.address);

    const transferAmount = ethers.utils.parseEther("100"); // Convert 100 MATIC to wei
    const tx = await maticToken.connect(deployer).transfer( maticToken.address, transferAmount);
    await tx.wait()

    const {VRFCoordinatorV2Mock, subId} = await deployCoordinator()
    const MockUSDT = await hre.ethers.getContractFactory("USDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    replaceAbi(`USDT`)
    replaceConstantsValue(`USDTContractAddress`, mockUSDT.address)

    console.log("USDT Token deployed to:", mockUSDT.address);


    for(let i = 0; i < otherAccounts.length; i++ ){
        await mockUSDT.connect(deployer).transfer(otherAccounts[i].address, dollar(1000));
    }

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(
        mockUSDT.address,
        dollar(1000),
        [ dollar(3), dollar(2), dollar(1)],
        subId,
        VRFCoordinatorV2Mock.address,
        keyHash
    );

    await lottery.deployed();

    await VRFCoordinatorV2Mock.addConsumer(subId, lottery.address)

    console.log("Lottery deployed to:", lottery.address);

    replaceAbi(`Lottery`)
    replaceConstantsValue(`MainContractAddress`, lottery.address)

    await transferUSDTToLottery(mockUSDT, lottery, deployer, [dollar(10), dollar(100)], 10)


}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}