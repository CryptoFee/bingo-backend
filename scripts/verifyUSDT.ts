
import hre from "hardhat";

async function main() {

    await hre.run("verify:verify", {
        address: "0xc8BE7Bf128B15c6c6Fcc07a73320f84dB785a285",
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