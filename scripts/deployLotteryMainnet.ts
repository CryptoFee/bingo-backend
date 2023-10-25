import hre, {ethers} from "hardhat";
import {dollar} from "../test/utils/helpers";
import {getAbi, replaceENV} from "./helpers/replace";
import {createUser, getAccessToken, getHttpClient} from "./helpers/auth";

async function main() {

    const Lottery = await ethers.getContractFactory("Lottery");

    const contract = await Lottery.deploy(
        process.env.USDT_ADDRESS || "",
        dollar(10000),
        2,
        [
            dollar(3000),
            dollar(200),
            dollar(100),
            dollar(50),
            dollar(25),
            dollar(10),
            dollar(5),
            dollar(2),
            dollar(1),
            dollar(1),
        ],
        Number(process.env.SUB_ID),
        process.env.COORDINATOR || "",
        process.env.KEY_HASH || "",
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