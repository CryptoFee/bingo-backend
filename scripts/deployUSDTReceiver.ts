import {replaceAbi, replaceConstantsValue} from "./replace";
import {main as mainUSDT} from "./deployUSDT"


const hre = require("hardhat");

async function main() {

    const usdtTokenAddress = "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E" //await mainUSDT()

    const USDTReceiver = await hre.ethers.getContractFactory("USDTReceiver");
    const usdtReceiver = await USDTReceiver.deploy(usdtTokenAddress);

    await usdtReceiver.deployed();

    console.log("USDTReceiver deployed to:", usdtReceiver.address);

    replaceAbi("USDTReceiver")
    replaceConstantsValue("mainContractAddress", usdtReceiver.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export {}
