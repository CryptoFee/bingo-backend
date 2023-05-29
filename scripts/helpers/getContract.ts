import {getAbi} from "./replace";
import hre from "hardhat";

export const getContract = async (name : string, address : string) => {

    const contractAbi = getAbi(name)
    return new hre.ethers.Contract(address, JSON.parse(contractAbi).abi, hre.ethers.provider.getSigner());
}