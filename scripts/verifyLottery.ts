
import hre from "hardhat";
import {dollar, getArguments} from "../test/utils/helpers";
import {env} from "./helpers/utils";

async function main() {

    const {prizes, cycles, maxAmount, maxItemsInDB} = getArguments()

    await hre.run("verify:verify", {
        address: process.env.LOTTERY_ADDRESS,
        constructorArguments: [
            env("USDT_ADDRESS"),
            dollar(maxAmount),
            cycles,
            prizes,
            Number(env("SUB_ID")),
            env("COORDINATOR"),
            env("KEY_HASH"),
            maxItemsInDB
        ],
    });

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}