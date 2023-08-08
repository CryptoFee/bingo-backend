import {initialTransferAmount} from "../test/utils/createRandomPlayerWithUSDT";
import {ethers} from "hardhat";
import {BigNumber} from "ethers";
import {dollar} from "../test/utils/helpers";
import {getContract} from "./helpers/getContract";

export const transferUSDTToLottery = async (usdt: any, lotteryAddress: any, deployer: any, rang: BigNumber[], amountOfPLayer: number) => {

    for (let i = 0; i < amountOfPLayer; i++) {

        const randomWallet = await ethers.Wallet.createRandom();

        await usdt.connect(deployer).transfer(randomWallet.address, dollar(5000));

        const etherAmount = ethers.utils.parseEther("0.1"); // Convert 1 Ether to its smallest unit (10^18)

        await deployer.sendTransaction({
            to: randomWallet.address,
            value: etherAmount,
        });

        const playerWithProvider = randomWallet.connect(deployer.provider!);
        //@ts-ignore
        const lottery = await getContract("Lottery", lotteryAddress, playerWithProvider)

        const transferAmount = getRandomInt(rang[0].toNumber(), rang[1].toNumber())

        const approveTx = await usdt.connect(playerWithProvider).approve(
            lotteryAddress,
            transferAmount,
            {
                from: randomWallet.address,
            }
        );

        await approveTx.wait();
        const tx = await lottery.buyTickets(transferAmount, {gasLimit: 300000})
        await tx.wait()

        console.log(`Player : ${i} finished`);

    }

}

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min /  10 ** 6);
    max = Math.floor(max / 10 ** 6);
    return  (Math.floor(Math.random() * (max - min + 1)) + min ) * (10 ** 6);
}