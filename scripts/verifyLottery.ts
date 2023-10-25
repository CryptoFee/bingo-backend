
import hre from "hardhat";
import {dollar} from "../test/utils/helpers";

async function main() {

    await hre.run("verify:verify", {
        address: process.env.LOTTERY_ADDRESS,
        constructorArguments: [
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