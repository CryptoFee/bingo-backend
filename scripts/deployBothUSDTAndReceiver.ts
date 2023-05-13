import {replaceAbi, replaceConstantsValue} from "./replace";
import {ethers} from "hardhat";

const hre = require("hardhat");

export async function main() {
    const MockUSDT = await hre.ethers.getContractFactory("USDT");
    const mockUSDT = await MockUSDT.deploy();

    await mockUSDT.deployed();

    console.log("MockUSDT deployed to:", mockUSDT.address);

    replaceConstantsValue("USDTContractAddress", mockUSDT.address)
    replaceAbi("USDT")

    const USDTReceiver = await hre.ethers.getContractFactory("USDTReceiver");
    const usdtReceiver = await USDTReceiver.deploy(mockUSDT.address);

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
