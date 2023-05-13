import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture";
import {createRandomPlayerWithUSDT} from "./utils/createRandomPlayerWithUSDT";
import {expect} from "chai";
import {dollar} from "./utils/helpers";

describe("Lottery Unit Tests Basic", async function () {
    it('Should successfully add a player', async () => {

        const {Lottery, MockUSDT, deployer} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy()
        )

        const amountToApprove = dollar(3)

        const player = await createRandomPlayerWithUSDT(MockUSDT, deployer)
        const playerInitialBalance = await MockUSDT.balanceOf(player.address);
        const playerWithProvider = player.connect(deployer.provider!);

        const approveTx = await MockUSDT.connect(playerWithProvider).approve(
            Lottery.address,
            amountToApprove,
            {
                from: player.address,
            }
        );

        await approveTx.wait();
        const allowance = await MockUSDT.allowance(player.address, Lottery.address);

        expect(allowance).to.equal(amountToApprove);

        const contractInitialBalance = await MockUSDT.balanceOf(Lottery.address);
        await Lottery.buyLotteryTickets(player.address, amountToApprove)

        const contractBalance = await MockUSDT.balanceOf(Lottery.address);
        const playerBalance = await MockUSDT.balanceOf(player.address);

        expect(contractBalance).to.equal(contractInitialBalance.toNumber() + amountToApprove.toNumber());
        expect(playerBalance).to.equal(playerInitialBalance.toNumber() - amountToApprove.toNumber());
    })
})