
import hre from "hardhat";
import {dollar} from "../test/utils/helpers";

async function main() {

    await hre.run("verify:verify", {
        address: process.env.LOTTERY_ADDRESS,
        constructorArguments: [
            process.env.USDT_ADDRESS || "",
            dollar(1000000),
            2,
            [
                dollar(300000),
                dollar(20000),
                dollar(10000),
                dollar(5000),
                dollar(2500),
                dollar(1000),
                dollar(500),
                dollar(200),
                dollar(100),
                dollar(100),
            ],
            Number(process.env.SUB_ID),
            process.env.COORDINATOR || "",
            process.env.KEY_HASH || "",
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