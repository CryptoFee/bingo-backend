import hre from "hardhat";
import {dollar, getArguments, splitArrayIntoChunks} from "../test/utils/helpers";
import {env, verify} from "./helpers/utils";
import {getAbi, replaceENV} from "./helpers/replace";
import {createUser, getAccessToken, getHttpClient} from "./helpers/auth";
import {getContract} from "./helpers/getContract";

async function main() {

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    const DBLottery = await hre.ethers.getContractFactory("DBContract");

    const dbLotteryAddresses: string[] = []

    const {dbCount, prizes, cycles, maxAmount, maxItemsInDB} = getArguments()

    for (let i = 0; i < dbCount; i++) {
        const dbLottery = await DBLottery.deploy();
        await dbLottery.deployed();
        dbLotteryAddresses.push(dbLottery.address)
        console.log(`Deployed contract ${i} at: ${dbLottery.address}`);
    }

    const contract = await Lottery.deploy(
        env("USDT_ADDRESS"),
        dollar(maxAmount),
        cycles,
        prizes,
        Number(env("SUB_ID")),
        env("COORDINATOR"),
        env("KEY_HASH"),
        maxItemsInDB
    );

    await contract.deployed()

    for (let i = 0; i < dbLotteryAddresses.length; i++) {
        const dbLottery = await getContract("DBContract", dbLotteryAddresses[i])
        await dbLottery.setAllowedAddress(contract.address)
    }

    const addressLen = dbLotteryAddresses.length
    const chunkSize = addressLen > 500 ? addressLen / 2 : addressLen

    const addresses = splitArrayIntoChunks(dbLotteryAddresses, chunkSize)
    await Promise.all(addresses.map(async a => await contract.setDBContracts(a)))

    replaceENV(`LOTTERY_ADDRESS`, contract.address, ".env.production")

    let accessToken

    try {
        accessToken = await getAccessToken()
    } catch (e) {
        await createUser()
        accessToken = await getAccessToken()
    }

    const client = getHttpClient()
    const {hash} = contract.deployTransaction;

    const txReceipt = await contract.provider.getTransactionReceipt(hash);
    const blockNumber = txReceipt.blockNumber

    await client.post('/contract', {
        address: contract.address,
        abi: JSON.stringify(JSON.parse(getAbi("Lottery")).abi),
        isActive: true,
        currentCycle: 1,
        maxAmount: maxAmount,
        prizes: prizes.map(p => p.div(1000000).toNumber()),
        USDTAddress: env("USDT_ADDRESS"),
        cycleLimit: cycles,
        dbLotteryAddresses,
        blockNumber,
        lastCheckedBlockNumber: blockNumber,
        transactionHash: hash


    }, {headers: {Authorization: `Bearer ${accessToken}`}})

    await contract.registerSelf();
    await verify(contract.address)

    console.log("Lottery deployed to:", contract.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}