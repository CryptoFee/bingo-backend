import {generatePlayers, initialTransferAmount} from "../test/utils/createRandomPlayerWithUSDT";
import {ethers} from "hardhat";

export const transferUSDTToLottery = async (usdt : any, lottery : any, deployer : any, rang : number[], amountOfPLayer : number) => {

    for (let i = 0; i <= amountOfPLayer; i++) {

        console.log("iteration : " , i);

        const randomWallet = ethers.Wallet.createRandom();

        await usdt.connect(deployer).transfer(randomWallet.address,initialTransferAmount);

        const player = randomWallet

        const etherAmount = ethers.utils.parseEther("0.1"); // Convert 1 Ether to its smallest unit (10^18)

        await deployer.sendTransaction({
            to: player.address,
            value: etherAmount,
        });

        const playerWithProvider = player.connect(deployer.provider!);

        const transferAmount =  getRandomInt(rang[0], rang[1])

        const approveTx = await usdt.connect(playerWithProvider).approve(
            lottery.address,
            transferAmount,
            {
                from: player.address,
            }
        );

        await approveTx.wait();
        const tx = await lottery.buyLotteryTickets(player.address, transferAmount, {gasLimit: 300000})
        await tx.wait()

    }

}

function getRandomInt(min : number, max : number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}