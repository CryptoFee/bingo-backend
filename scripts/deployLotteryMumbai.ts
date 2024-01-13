import hre from "hardhat";
import {dollar, splitArrayIntoChunks} from "../test/utils/helpers";
import {env, waitForBlocks} from "./helpers/utils";
import {getAbi, replaceENV} from "./helpers/replace";
import {createUser, getAccessToken, getHttpClient} from "./helpers/auth";
import {getContract} from "./helpers/getContract";


async function main() {

    const Lottery = await hre.ethers.getContractFactory("Lottery");

    const dbLotteryAddresses: string[] = []
    let totalContracts = 1000;
    let batchSize = 1000;
    let blockInterval = 100; // Number of blocks to wait



    for (let i = 0; i < totalContracts; i += batchSize) {
        await deployContracts(i, Math.min(i + batchSize, totalContracts), (addr) => {
            dbLotteryAddresses.push(addr)
        });
        console.log(`Batch ${i/batchSize + 1} deployed, waiting for next interval.`);
       // await waitForBlocks(blockInterval);
    }

    const estimatedLotteryGas = await hre.ethers.provider.estimateGas(Lottery.getDeployTransaction(
        env("USDT_ADDRESS"),
        dollar(1000000),
        1,
        [
            dollar(300000),
            dollar(200000),
            dollar(100000),
            dollar(50000),
            dollar(25000),
            dollar(10000),
            dollar(5000),
            dollar(2000),
            dollar(1000),
            dollar(1000),
        ],
        Number( env("SUB_ID")),
        env("COORDINATOR"),
        env("KEY_HASH"),
        1000));

    console.log(`Estimated Gas for Deployment: ${estimatedLotteryGas}`);

    const contract = await Lottery.deploy(
        env("USDT_ADDRESS"),
        dollar(1000000),
        1,
        [
            dollar(300000),
            dollar(200000),
            dollar(100000),
            dollar(50000),
            dollar(25000),
            dollar(10000),
            dollar(5000),
            dollar(2000),
            dollar(1000),
            dollar(1000),
        ],
        Number( env("SUB_ID")),
        env("COORDINATOR"),
        env("KEY_HASH"),
        1000
    );

    await contract.deployed()

    for (let i = 0; i < dbLotteryAddresses.length; i++) {
        const dbLottery =  await getContract("DBContract", dbLotteryAddresses[i])
        await dbLottery.setAllowedAddress(contract.address)
    }

    const addresses = splitArrayIntoChunks(dbLotteryAddresses, 500)


    const estimate = await contract.estimateGas.setDBContracts(addresses[0])
    console.log(`.: ${estimate}`);

    await contract.setDBContracts(addresses[0])
    await contract.setDBContracts(addresses[1])

    replaceENV(`LOTTERY_ADDRESS`, contract.address, ".env.mumbai")

    let accessToken

    try {
        accessToken = await getAccessToken()
    } catch (e) {
        await createUser()
        accessToken = await getAccessToken()
    }

    const client = getHttpClient()

    await client.post('/contract', {
        address: contract.address,
        abi: JSON.stringify(JSON.parse(getAbi("Lottery")).abi),
        isActive: true
    }, {headers: {Authorization: `Bearer ${accessToken}`}})


    console.log("Lottery deployed to:", contract.address);

}

async function deployContracts(startIndex : number, endIndex : number, cb : (addr : string) => void) {
    const DBLottery = await hre.ethers.getContractFactory("DBContract");
    for (let i = startIndex; i < endIndex; i++) {
        const dbLottery = await DBLottery.deploy();
        await dbLottery.deployed();
        cb(dbLottery.address)
        console.log(`Deployed contract ${i} at: ${dbLottery.address}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}