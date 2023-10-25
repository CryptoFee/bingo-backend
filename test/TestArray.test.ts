import {ethers} from "hardhat";


describe("testArray Unit", async function () {
    it('Add  1000000 array of items', async () => {

        const TestArrayFactory = await ethers.getContractFactory("TestArray");

        const [deployer] = await ethers.getSigners()

        const TestArray = await TestArrayFactory
            .connect(deployer)
            .deploy()

/*        const players = Array(1000).fill(1).map((_, i) => ({
                playerAddress: "0x6B9C4119796C80Ced5a3884027985Fd31830555b",
                start: i,
                end: i + 1
            }
        ))

        const randomNumbers = Array(10).fill(1)


        for (let i = 0; i < 250; i++) {
            await TestArray.addPlayer(players, {gasLimit: Number.MAX_SAFE_INTEGER - 1})
        }*/

        const randomNumbers = Array(10).fill(1)

        await TestArray.receivePlayersAndPickWinner(randomNumbers, {gasLimit: Number.MAX_SAFE_INTEGER - 1})
    })
})