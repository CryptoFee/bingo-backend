import hre from "hardhat";
import {getAbi, replaceAbi, replaceConstantsValue} from "./helpers/replace";
import {transferUSDTToLottery} from "./transferUSDTToLottery";
import {dollar} from "../test/utils/helpers";
import {createUser, getAccessToken, getHttpClient} from "./helpers/auth";
import {getContract} from "./helpers/getContract";

export const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"

async function main() {

    const [deployer, ...otherAccounts] = await hre.ethers.getSigners()

    const mockUSDT = await getContract("USDT", process.env.USDT_ADDRESS || "")
    const VRFCoordinatorV2Mock = await getContract("VRFCoordinatorV2Mock", process.env.MOCK_COORDINATOR_ADDRESS || "")
    const subId = process.env.SUB_ID

    console.log("USDT Token address is ", mockUSDT.address);

    for (let i = 0; i < otherAccounts.length; i++) {
        await mockUSDT.connect(deployer).transfer(otherAccounts[i].address, dollar(10000));
    }

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(
        mockUSDT.address,
        dollar(1000),
        4,
        [dollar(3), dollar(2), dollar(1)],
        Number(subId),
        VRFCoordinatorV2Mock.address,
        keyHash
    );

    await lottery.deployed();

    await VRFCoordinatorV2Mock.addConsumer(subId, lottery.address)

    console.log("Lottery deployed to:", lottery.address);

    let accessToken

    try {
        accessToken = await getAccessToken()
    } catch {
        await createUser()
        accessToken = await getAccessToken()
    }

    const client = getHttpClient()

    await client.post('/contract', {
        address: lottery.address,
        abi: getAbi("Lottery"),
        isActive: true
    }, {headers: {Authorization: `Bearer ${accessToken}`}})

    replaceAbi(`Lottery`)
    replaceConstantsValue(`MainContractAddress`, lottery.address)

    await transferUSDTToLottery(mockUSDT, lottery.address, deployer, [dollar(10), dollar(100)], 10)

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}