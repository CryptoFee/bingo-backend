import {generatePlayers, initialTransferAmount} from "./utils/createRandomPlayerWithUSDT";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture";
import {dollar, getArguments} from "./utils/helpers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {expect} from "chai"
import {BigNumber} from "ethers";

const transferAmount = dollar(5)

describe("Lottery unit tests with full implementation", async () => {
    it("Should successfully add multiple players with each 1$ And Check for winners balances", async () => {

        const {Lottery, MockUSDT, deployer, VRFCoordinatorV2Mock} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const {prizes, cycles, maxAmount} = getArguments()

        const players = await generatePlayers(100)(MockUSDT, deployer)
        const startGame = async (iteration: number, initialAmount: BigNumber) => {

            const ownerInitialBalance = await MockUSDT.balanceOf(deployer.address);

            for (let i = 0; i < players.length; i++) {
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
                const tx = await Lottery.buyTickets(player.address, transferAmount, {gasLimit: 300000})
                await tx.wait()
                const [isActive] = await Lottery.getLotteryDetails(1)

                if (!isActive) {
                    break;
                }
            }

            await VRFCoordinatorV2Mock.fulfillRandomWords(iteration, Lottery.address, {gasLimit: 2500000})

            interface Player {
                playerAddress: string;
                start: BigNumber;
                end: BigNumber;
            }

            await new Promise<void>(async (resolve, reject) => {
                Lottery.on("Winners", async (rndNumber: BigNumber[]) => {

                    const [_, playersData] = await Lottery.getLotteryDetails(1)
                    try {
                        const binarySearch = (target: BigNumber, mappedPlayers: Player[]) => {
                            let low = 0;
                            let high = mappedPlayers.length - 1;
                            while (low <= high) {
                                let mid = Math.round(low + (high - low) / 2);
                                const player = mappedPlayers[mid]
                                if (target.gte(player.start) && target.lte(player.end)) {
                                    return player.playerAddress;
                                } else if (target.lt(player.start)) {
                                    high = mid - 1;
                                } else {
                                    low = mid + 1;
                                }
                            }
                            return "";
                        }

                        const mappedData: Player[] = playersData.map((p: any) => {
                            return {
                                playerAddress: p["addr"],
                                start: p["start"],
                                end: p["end"]
                            }
                        })

                        for (let i = 0; i < rndNumber.length; i++) {
                            const luckyNumber = rndNumber[i].mod(100000000).add(1);
                            const luckyPlayer = binarySearch(luckyNumber, mappedData)
                            const playerBalance = await MockUSDT.balanceOf(luckyPlayer);
                            expect(playerBalance).gt(initialAmount.sub(transferAmount))
                        }
                        resolve()
                    } catch (e) {
                        reject(e)
                    }
                })
            })

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