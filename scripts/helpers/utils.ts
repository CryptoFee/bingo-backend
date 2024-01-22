import hre from "hardhat";
import {dollar, getArguments} from "../../test/utils/helpers";

export const env = (envName : string) => process.env[envName] || ""
export const sleep = async (ml : number) =>  await new Promise(resolve => setTimeout(resolve, ml));
export async function verify(address : string){
    const {prizes, cycles, maxAmount, maxItemsInDB} = getArguments()

    await hre.run("verify:verify", {
        address,
        constructorArguments: [
            env("USDT_ADDRESS"),
            dollar(maxAmount),
            cycles,
            prizes,
            Number(env("SUB_ID")),
            env("COORDINATOR"),
            env("KEY_HASH"),
            maxItemsInDB
        ],
    });
}