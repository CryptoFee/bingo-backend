
import hre from "hardhat";

async function main() {

    await hre.run("verify:verify", {
        address: process.env.USDT_ADDRESS,
        constructorArguments: [],
    });

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}