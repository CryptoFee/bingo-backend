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

        const {prizes, cycles, maxAmount} = getArguments()

        const players = await generatePlayers(10)(MockUSDT, deployer)
        let playersData: any;
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
                const [isActive, playersDataFromContract] = await Lottery.getLotteryDetails()

                if (!isActive) {
                    playersData = playersDataFromContract
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

                    try {
                        const binarySearch = (target: BigNumber, mappedPLayers: Player[]) => {
                            let low = 0;
                            let high = mappedPLayers.length - 1;
                            while (low <= high) {
                                let mid = Math.round((low + high) / 2);
                                if (target >= mappedPLayers[mid].start && target <= mappedPLayers[mid].end) {
                                    return mappedPLayers[mid].playerAddress;
                                } else if (target < mappedPLayers[mid].start) {
                                    high = mid - 1;
                                } else {
                                    low = mid + 1;
                                }
                            }

                            return "";
                        }

                        for (let i = 0; i < rndNumber.length; i++) {
                            const luckyNumber = rndNumber[i].mod(100000000).add(1);

                            const mappedData: Player[] = playersData.map((p: any) => {
                                return {
                                    playerAddress: p["playerAddress"],
                                    start: p["start"],
                                    end: p["end"]
                                }
                            })

                            const luckyPlayer = binarySearch(luckyNumber, mappedData)
                            const playerBalance = await MockUSDT.balanceOf(luckyPlayer);
                            expect(playerBalance).to.equal(initialAmount.sub(transferAmount).add(prizes[i]))

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