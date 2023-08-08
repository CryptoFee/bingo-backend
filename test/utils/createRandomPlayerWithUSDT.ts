import {ethers} from "hardhat";
import {dollar} from "./helpers";

export const initialTransferAmount = dollar(1000);
export const createRandomPlayerWithUSDT = async (mockUSDTContract: any, deployer: any, etherStringAmount : string = "0.1") => {

    const randomWallet = ethers.Wallet.createRandom();

    await mockUSDTContract.connect(deployer).transfer(randomWallet.address,initialTransferAmount);

    const etherAmount = ethers.utils.parseEther(etherStringAmount); // Convert 1 Ether to its smallest unit (10^18)

    await deployer.sendTransaction({
        to: randomWallet.address,
        value: etherAmount,
    });

    return randomWallet;
}

export const generatePlayers = (numb: number) => async (mockUSDTContract: any, deployer: any, etherStringAmount : string = "0.1") => {
    return await Promise.all(
        Array(numb).fill(0).map(async () => await createRandomPlayerWithUSDT(mockUSDTContract, deployer, etherStringAmount))
    )
}