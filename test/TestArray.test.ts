import {ethers} from "hardhat";


describe("testArray Unit", async function () {
    it('Add then delete  1000000 array of items', async () => {

        const TestArrayFactory = await ethers.getContractFactory("TestArray");

        const [deployer] = await ethers.getSigners()

        const TestArray = await TestArrayFactory
            .connect(deployer)
            .deploy()

        for (let i = 0; i <= 2000; i++) {
           await TestArray.addPlayer({
                playerAddress: "0x6B9C4119796C80Ced5a3884027985Fd31830555b",
                start: i,
                end: i + 1
            })
        }

        await TestArray.deletePlayers()

    })
})