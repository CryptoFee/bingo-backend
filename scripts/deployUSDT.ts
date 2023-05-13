import {replaceAbi, replaceConstantsValue} from "./replace";

const hre = require("hardhat");

export async function main() {
    const MockUSDT = await hre.ethers.getContractFactory("USDT");
    const mockUSDT = await MockUSDT.deploy();

    await mockUSDT.deployed();

    console.log("MockUSDT deployed to:", mockUSDT.address);

    replaceConstantsValue("USDTContractAddress", mockUSDT.address)
    replaceAbi("USDT")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

export {}
