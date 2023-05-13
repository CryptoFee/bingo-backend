import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture";
import {createRandomPlayerWithUSDT, generatePlayers} from "./utils/createRandomPlayerWithUSDT";
import {expect} from "chai";
import {
    AmountExceededMaxAmount,
    AmountTooMuchForCurrentCycle,
    dollar,
    getArguments,
    TooMuchAmount
} from "./utils/helpers";

describe("Lottery Unit Tests", async function () {

    const {maxAmount, prizes} = getArguments()

    describe("10 player failure", async () => {
        it("Should revert with message", async function () {

            const {Lottery, MockUSDT, deployer} = await loadFixture(
                createRandomNumberConsumerFixtureDeploy()
            )

            const player = await createRandomPlayerWithUSDT(MockUSDT, deployer)

            const {amount, revertedWith} = AmountExceededMaxAmount(maxAmount / 10)

            const playerWithProvider = player.connect(deployer.provider!);

            const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                Lottery.address,
                amount,
                {
                    from: player.address,
                }
            );

            await approveTx.wait();
            await expect(Lottery.buyLotteryTickets(player.address, amount, {gasLimit: 2000000})).to.be.revertedWith(revertedWith);

        })

        it("Should revert with message #2", async function () {

            const {Lottery, MockUSDT, deployer} = await loadFixture(
                createRandomNumberConsumerFixtureDeploy()
            )

            const player = await createRandomPlayerWithUSDT(MockUSDT, deployer)
            const player2 = await createRandomPlayerWithUSDT(MockUSDT, deployer)

            const {amount, revertedWith} = AmountExceededMaxAmount(maxAmount / 10)

            const playerWithProvider = player.connect(deployer.provider!);

            const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                Lottery.address,
                dollar(1),
                {
                    from: player.address,
                }
            );

            await approveTx.wait();
            await expect(Lottery.buyLotteryTickets(player.address, dollar(1), {gasLimit: 2000000})).to.not.be.revertedWith(revertedWith);

            const player2WithProvider = player2.connect(deployer.provider!);

            const approveTx2 = await MockUSDT.connect(player2WithProvider).approve(
                Lottery.address,
                amount,
                {
                    from: player2.address,
                }
            );

            await approveTx2.wait();
            await expect(Lottery.buyLotteryTickets(player2.address, amount, {gasLimit: 2000000})).to.be.revertedWith(revertedWith);

        })

        it("Should revert with message #3", async function () {

            const {Lottery, MockUSDT, deployer} = await loadFixture(
                createRandomNumberConsumerFixtureDeploy()
            )

            const amountTooMuch = AmountTooMuchForCurrentCycle(maxAmount / 10)

            const players = await generatePlayers(amountTooMuch.length)(MockUSDT, deployer)

            for (let i = 0; i < players.length; i++) {
                const player = players[i]

                const playerWithProvider = player.connect(deployer.provider!);
                const amount = amountTooMuch[i].amount

                const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                    Lottery.address,
                    amount,
                    {
                        from: player.address,
                    }
                );

                await approveTx.wait();

                if (i == amountTooMuch.length - 1) {
                    await expect(Lottery.buyLotteryTickets(player.address, amount, {gasLimit: 20000000})).to.be.revertedWith(TooMuchAmount);
                } else {
                    await expect(Lottery.buyLotteryTickets(player.address, amount, {gasLimit: 20000000})).to.not.be.revertedWith(TooMuchAmount);
                }
            }
        })
    })
})