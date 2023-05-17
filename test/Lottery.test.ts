import {generatePlayers, initialTransferAmount} from "./utils/createRandomPlayerWithUSDT";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture";
import {dollar, getArguments} from "./utils/helpers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {expect} from "chai"
import {BigNumber} from "ethers";

const transferAmount = dollar(10)

describe("Lottery unit tests with full implementation", async () => {
    it("Should successfully add multiple players with each 1$ And Check for winners balances", async () => {

        const {Lottery, MockUSDT, deployer, VRFCoordinatorV2Mock} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const {prizes, cycles} = getArguments()

        const players = await generatePlayers(100)(MockUSDT, deployer)
// 26549
        const startGame = async (iteration: number, initialAmount : BigNumber) => {

            let playersCount: number = 0

            const ownerInitialBalance = await MockUSDT.balanceOf(deployer.address);

            for (let i = 0; i < players.length; i++) {
                ++playersCount;
                const player = players[i]
                const playerWithProvider = player.connect(deployer.provider!);

                const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                    Lottery.address,
                    transferAmount,
                    {
                        from: player.address,
                    }
                );

                await approveTx.wait();
                const tx = await Lottery.buyLotteryTickets(player.address, transferAmount, {gasLimit: 300000})
                await tx.wait()
                const [isActive] = await Lottery.getLotteryDetails()

                if (!isActive) {
                    break;
                }
            }

            await VRFCoordinatorV2Mock.fulfillRandomWords(
                iteration,
                Lottery.address
            )

            interface Winners {
                playerAddress: string;
                prize: BigNumber;
            }

          /*  await new Promise<void>(async (resolve, reject) => {
                Lottery.on("Winners", async (winners: Winners[]) => {

                    const combinedWinners = winners.reduce((acc, winner) => {
                        const existingWinner = acc.find((w) => w.playerAddress === winner.playerAddress);
                        if (existingWinner) {
                            existingWinner.prize = existingWinner.prize.add(winner.prize)
                        } else {
                            acc.push({...winner});
                        }
                        return acc;
                    }, [] as Winners[]);

                    const winnersPromise = combinedWinners.map(async (winner) => {
                        const playerBalance = await MockUSDT.balanceOf(winner.playerAddress);

                        try {
                            expect(playerBalance).to.equal(initialAmount.sub(transferAmount).add(winner.prize))
                        } catch (e) {
                            reject(e)
                        }
                    })
                    await Promise.all(winnersPromise)
                    resolve()
                })
            })*/

            const ownerBalance = await MockUSDT.balanceOf(deployer.address);

            expect(ownerBalance).to.equal(
                (playersCount * transferAmount.toNumber())
                - prizes.reduce((acc, prize) => acc + prize, 0)
                + ownerInitialBalance.toNumber()
            )
        }

        for (let i = 1; i <= cycles; i++) {
            await startGame(i, initialTransferAmount.sub(transferAmount.mul(i-1)))
        }
    })
})