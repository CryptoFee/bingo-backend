import hre from "hardhat";
import {replaceAbi, replaceConstantsValue, replaceENV} from "./helpers/replace";

async function main() {

    const MockUSDT = await hre.ethers.getContractFactory("USDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    replaceAbi(`USDT`)
    replaceENV(`USDT_ADDRESS`, mockUSDT.address)

    console.log("USDT Token deployed to:", mockUSDT.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}