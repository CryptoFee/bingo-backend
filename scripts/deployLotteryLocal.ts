import hre from "hardhat";
import {dollar, splitArrayIntoChunks} from "../test/utils/helpers";
import {env} from "./helpers/utils";
import {getAbi, replaceAbi, replaceENV} from "./helpers/replace";
import {createUser, getAccessToken, getHttpClient} from "./helpers/auth";
import {getContract} from "./helpers/getContract";


const PRIZES = [
    300000,
    200000,
    100000,
    50000,
    25000,
    10000,
    5000,
    2500,
    1000,
    500,
]
async function main() {

    const Lottery = await hre.ethers.getContractFactory("Lottery");

    const dbLotteryAddresses: string[] = []
    let totalContracts = 1000;
    let batchSize = 1000;


    for (let i = 0; i < totalContracts; i += batchSize) {
        await deployContracts(i, Math.min(i + batchSize, totalContracts), (addr) => {
            dbLotteryAddresses.push(addr)
        });
        console.log(`Batch ${i/batchSize + 1} deployed, waiting for next interval.`);
        // await waitForBlocks(blockInterval);
    }
    console.log("Reached")

    const contract = await Lottery.deploy(
        env("USDT_ADDRESS"),
        dollar(Number(env("MAX_AMOUNT"))),
        1,
        PRIZES.map(p => dollar(p)),
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

    await contract.setDBContracts(addresses[0])
    await contract.setDBContracts(addresses[1])

    replaceENV(`LOTTERY_ADDRESS`, contract.address, ".env")

    let accessToken

    try {
        accessToken = await getAccessToken()
    } catch (e) {
        await createUser()
        accessToken = await getAccessToken()
    }

    const client = getHttpClient()
    const { blockNumber, hash } = contract.deployTransaction;

    await client.post('/contract', {
        address: contract.address,
        abi: JSON.stringify(JSON.parse(getAbi("Lottery")).abi),
        isActive: true,
        currentCycle: 1,
        maxAmount: Number(env("MAX_AMOUNT")),
        prizes: PRIZES,
        USDTAddress: env("USDT_ADDRESS"),
        cycleLimit: Number(env("CYCLE_LIMIT")),
        dbLotteryAddresses,
        blockNumber,
        lastCheckedBlockNumber: blockNumber,
        transactionHash: hash


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