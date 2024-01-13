import hre from "hardhat";

export const env = (envName : string) => process.env[envName] || ""
export const sleep = async (ml : number) =>  await new Promise(resolve => setTimeout(resolve, ml));
export async function waitForBlocks(numberOfBlocks : number) {
    const startBlock = await hre.ethers.provider.getBlockNumber();
    let currentBlock = startBlock;



    while (currentBlock < startBlock + numberOfBlocks) {
        console.log({startBlock, currentBlock})
        await sleep(10000)
        currentBlock = await hre.ethers.provider.getBlockNumber();
    }
}