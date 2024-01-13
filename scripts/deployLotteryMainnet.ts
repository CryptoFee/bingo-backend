import hre from "hardhat";
import {dollar} from "../test/utils/helpers";
import {getAbi, replaceENV} from "./helpers/replace";
import {createUser, getAccessToken, getHttpClient} from "./helpers/auth";

async function main() {

    const Lottery = await hre.ethers.getContractFactory("Lottery");

    const DBLottery = await hre.ethers.getContractFactory("DBContract");

    const dbLotteryAddresses: string[] = []

    for (let i = 0; i < 1000; i++) {
        const dbLottery = await DBLottery.deploy()
        dbLotteryAddresses.push(dbLottery.address)
    }

    const contract = await Lottery.deploy(
        process.env.USDT_ADDRESS || "",
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
        Number(process.env.SUB_ID),
        process.env.COORDINATOR || "",
        process.env.KEY_HASH || "",
        dbLotteryAddresses,
        1000
    );
    await contract.deployed()

    replaceENV(`LOTTERY_ADDRESS`, contract.address, ".env.production")

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

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}