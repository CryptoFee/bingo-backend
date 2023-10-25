import {generatePlayers, initialTransferAmount} from "./utils/createRandomPlayerWithUSDT";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture.new";
import {dollar, getArguments} from "./utils/helpers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {expect} from "chai"
import {BigNumber} from "ethers";
import {getContract} from "../scripts/helpers/getContract";

const transferAmount = dollar(1)

describe("Lottery unit tests with full implementation", async () => {
    it.only("Should successfully add multiple players with each 1$ And Check for winners balances", async () => {

        const {Lottery, MockUSDT, deployer, VRFCoordinatorV2Mock} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const {prizes, cycles, maxAmount} = getArguments()

        const players = await generatePlayers(maxAmount)(MockUSDT, deployer)
        const startGame = async (iteration: number, initialAmount: BigNumber) => {

            const ownerInitialBalance = await MockUSDT.balanceOf(deployer.address);
console.log("PLayers", players.length)
            for (let i = 0; i < players.length; i++) {
                const player = players[i]

                const playerWithProvider = player.connect(deployer.provider!);

                // @ts-ignore
                const lottery = await getContract("LotteryNew", Lottery.address, playerWithProvider)

                const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                    Lottery.address,
                    transferAmount,
                );


                await approveTx.wait();

                const tx = await lottery.buyTickets(transferAmount, {gasLimit: 3000000})
                await tx.wait()
                const [isActive] = await Lottery.getLotteryDetails(1)
                console.log("Player bought ticket:", i);
                if (!isActive) {
                    break;
                }
            }

            const tx = await VRFCoordinatorV2Mock.fulfillRandomWords(iteration, Lottery.address, {gasLimit: 2500000})

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

describe("Lottery unit tests with less players than prizes", async () => {
    it("Should successfully buy tickets and win all prizes, 1 player", async () => {

        const {Lottery, MockUSDT, deployer, VRFCoordinatorV2Mock} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const {prizes, cycles, maxAmount} = getArguments()

        const transferAmount = dollar(maxAmount)

        const players = await generatePlayers(1)(MockUSDT, deployer,)
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
                const tx = await lottery.buyTickets(transferAmount, {gasLimit: 3000000})
                await tx.wait()
                const [isActive] = await Lottery.getLotteryDetails(1)

                if (!isActive) {
                    break;
                }
            }

            await VRFCoordinatorV2Mock.fulfillRandomWords(iteration, Lottery.address, {gasLimit: 2500000})

            // @ts-ignore
            const logs = await Lottery.queryFilter('Winner', 0, "latest")

            const accPrizes = prizes.reduce((acc, prize) => acc + prize, 0)

            await Promise.all(
                logs.map(async (event, index) => {
                    const playerAddress = event.args['player']
                    const playerBalance = await MockUSDT.balanceOf(playerAddress);
                    expect(playerBalance).equal(initialAmount.sub(transferAmount).add(accPrizes))
                })
            )

            const ownerBalance = await MockUSDT.balanceOf(deployer.address);

            expect(ownerBalance).to.equal(
                (maxAmount * 10 ** 6) - accPrizes
                + ownerInitialBalance.toNumber()
            )
        }

        for (let i = 1; i <= cycles; i++) {
            await startGame(i, initialTransferAmount.sub(transferAmount.mul(i - 1)))
        }
    })

    it("Should successfully buy tickets and win all prizes, 2 player", async () => {

        const {Lottery, MockUSDT, deployer, VRFCoordinatorV2Mock} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const {prizes, cycles, maxAmount} = getArguments()

        const transferAmount = dollar(maxAmount).div(BigInt(2))
        const players = await generatePlayers(2)(MockUSDT, deployer,)
        const startGame = async (iteration: number, initialAmount: BigNumber) => {


            const ownerInitialBalance = await MockUSDT.balanceOf(deployer.address);

            for (let i = 0; i < players.length; i++) {
                const player = players[i]

                const playerWithProvider = player.connect(deployer.provider!);

                // @ts-ignore
                const lottery = await getContract("LotteryNew", Lottery.address, playerWithProvider)

                const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                    Lottery.address,
                    transferAmount,
                    {
                        from: player.address,
                    }
                );

                await approveTx.wait();
                const tx = await lottery.buyTickets(transferAmount, {gasLimit: 3000000})
                await tx.wait()
                const [isActive] = await Lottery.getLotteryDetails(1)

                if (!isActive) {
                    break;
                }
            }

            await VRFCoordinatorV2Mock.fulfillRandomWords(iteration, Lottery.address, {gasLimit: 2500000})

            // @ts-ignore
            const logs = await Lottery.queryFilter('Winner', 0, "latest")

            const accPrizes = prizes.reduce((acc, prize) => acc + prize, 0)

            await Promise.all(
                logs.reduce((acc, event, index) => {
                    const address = event.args['player']
                    if (acc.find(a => {
                        return a.address === address
                    })) {
                        return acc
                    }

                    acc.push({
                        address,
                        win: logs.filter(a => a.args["player"] === address).reduce((acc, event) => {
                            acc += BigInt(event.args['amount'])
                            return acc
                        }, BigInt(0))
                    })

                    return acc
                }, [] as { address: string, win: bigint }[]).map(async ({address, win}: any) => {
                    const playerBalance = await MockUSDT.balanceOf(address);
                    expect(playerBalance).equal(initialAmount.sub(transferAmount).add(win))
                })
            )

            const ownerBalance = await MockUSDT.balanceOf(deployer.address);

            expect(ownerBalance).to.equal(
                (maxAmount * 10 ** 6) - accPrizes
                + ownerInitialBalance.toNumber()
            )
        }

        for (let i = 1; i <= cycles; i++) {
            await startGame(i, initialTransferAmount.sub(transferAmount.mul(i - 1)))
        }
    })
})