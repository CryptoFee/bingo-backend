
import hre from "hardhat";

async function main() {

    await hre.run("verify:verify", {
        address: process.env.LOTTERY_ADDRESS,
        constructorArguments: [
            10000000,
            10,
            [3000000,2000000,1000000],
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