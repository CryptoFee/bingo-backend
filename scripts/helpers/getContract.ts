import {getAbi} from "./replace";
import hre from "hardhat";
export const getContract = async (name : string, address : string, signer = hre.ethers.provider.getSigner()) => {

    const contractAbi = getAbi(name)
    return new hre.ethers.Contract(address, JSON.parse(contractAbi).abi, signer);
}