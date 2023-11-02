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
    const subId = process.env.SUB_ID || 1

    console.log("USDT Token address is ", mockUSDT.address);

    for (let i = 0; i < otherAccounts.length; i++) {
        await mockUSDT.connect(deployer).transfer(otherAccounts[i].address, dollar(10000));
    }

    const DBLottery = await hre.ethers.getContractFactory("DBContract");

    const dbLotteryAddresses: string[] = []

    for (let i = 0; i < 10; i++) {
        const dbLottery = await DBLottery.deploy()
        dbLotteryAddresses.push(dbLottery.address)
    }


    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const lottery = await Lottery.deploy(
        mockUSDT.address,
        dollar(100),
        1,
        [
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
            dollar(1),
        ],
        Number(subId),
        VRFCoordinatorV2Mock.address,
        keyHash,
        dbLotteryAddresses,
        10
    );

    await lottery.deployed();
    for (let i = 0; i < 10; i++) {
        const dbLottery =  await getContract("DBContract", dbLotteryAddresses[i])
        dbLottery.setAllowedAddress(lottery.address)
    }

    await VRFCoordinatorV2Mock.addConsumer(subId, lottery.address)

    console.log("Lottery deployed to:", lottery.address);

    let accessToken

    try {
        accessToken = await getAccessToken()
    } catch (e) {
        await createUser()
        accessToken = await getAccessToken()
    }


    const client = getHttpClient();

    await client.post('/contract', {
        address: lottery.address,
        abi: JSON.stringify(JSON.parse(getAbi("Lottery")).abi),
        isActive: true,
        currentCycle: 1
    }, {headers: {Authorization: `Bearer ${accessToken}`, "Content-Typ": "application/json"}})

    replaceAbi(`Lottery`)
    replaceConstantsValue(`MainContractAddress`, lottery.address)

    await transferUSDTToLottery(mockUSDT, lottery.address, deployer, [dollar(1), dollar(1)], 10)

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}