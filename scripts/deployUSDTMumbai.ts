import hre from "hardhat";
import {replaceAbi, replaceConstantsValue, replaceENV} from "./helpers/replace";

async function main() {

    const [deployer] = await hre.ethers.getSigners();

    console.log("deployer address: ", deployer.address);

    const MockUSDT = await hre.ethers.getContractFactory("USDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    replaceAbi(`USDT`)
    replaceENV(`USDT_ADDRESS`, mockUSDT.address, ".env.mumbai")

    console.log("USDT Token deployed to:", mockUSDT.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


export {}