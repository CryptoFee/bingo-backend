import {ethers} from "hardhat";

export const createDbContractsFixture = () => {
    return async function deployDbContractsFixture() {
        const [deployer] = await ethers.getSigners();
        const DbContractFactory = await ethers.getContractFactory("DBContract");

        const DBContract = await DbContractFactory
            .connect(deployer)
            .deploy();
        return { DBContract, deployer };
    }
}