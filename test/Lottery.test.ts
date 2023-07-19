import {generatePlayers, initialTransferAmount} from "./utils/createRandomPlayerWithUSDT";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture";
import {dollar, getArguments} from "./utils/helpers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {expect} from "chai"
import {BigNumber} from "ethers";
import {getContract} from "../scripts/helpers/getContract";

const transferAmount = dollar(1)

describe("Lottery unit tests with full implementation", async () => {
    it("Should successfully add multiple players with each 1$ And Check for winners balances", async () => {

        const {Lottery, MockUSDT, deployer, VRFCoordinatorV2Mock} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const {prizes, cycles, maxAmount} = getArguments()

        const players = await generatePlayers(maxAmount)(MockUSDT, deployer)
        const startGame = async (iteration: number, initialAmount: BigNumber) => {

            const ownerInitialBalance = await MockUSDT.balanceOf(deployer.address);

            for (let i = 0; i < players.length; i++) {
                const player = players[i]

                const playerWithProvider = player.connect(deployer.provider!);

                // @ts-ignore
                const lottery = await getContract("Lottery", Lottery.address, playerWithProvider)

                const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                    Lottery.address,
                    transferAmount,
                    {
                        from: player.address,
                    }
                );

                await approveTx.wait();
                const tx = await lottery.buyTickets(transferAmount, {gasLimit: 300000})
                await tx.wait()
                const [isActive] = await Lottery.getLotteryDetails(1)

                if (!isActive) {
                    break;
                }
            }

            await VRFCoordinatorV2Mock.fulfillRandomWords(iteration, Lottery.address, {gasLimit: 2500000})

            // @ts-ignore
            const logs = await Lottery.queryFilter('Winner', 0, "latest")

            await Promise.all(
                logs.map(async (event, index) => {
                    const playerAddress = event.args['player']
                    const playerBalance = await MockUSDT.balanceOf(playerAddress);
                    expect(playerBalance).equal(initialAmount.sub(transferAmount).add(prizes[index]))
                })
            )

            const ownerBalance = await MockUSDT.balanceOf(deployer.address);

            expect(ownerBalance).to.equal(
                (maxAmount * 10 ** 6) - prizes.reduce((acc, prize) => acc + prize, 0)
                + ownerInitialBalance.toNumber()
            )
        }

        for (let i = 1; i <= cycles; i++) {
            await startGame(i, initialTransferAmount.sub(transferAmount.mul(i - 1)))
        }
    })
})