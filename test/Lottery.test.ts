import {generatePlayers, initialTransferAmount} from "./utils/createRandomPlayerWithUSDT";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture";
import {asyncGenerator, dollar, getArguments} from "./utils/helpers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {getContract} from "../scripts/helpers/getContract";
import {createDbContractsFixture} from "./utils/deployDbContractsFixture";
import {expect} from "chai";

const transferAmount = dollar(500)

const DB_COUNTS = 1000;
const MAX_ITEMS_IN_DB = 1000;
const PLAYERS_COUNT = 2000;
const MIN_DEPOSIT = 1;

describe("Lottery unit tests with full implementation", async () => {
    it("Should successfully add multiple players with each 1$ And Check for winners balances", async () => {
        const dbContracts: any[] = [];
        // generating 10 contracts and storing them
        for await (const i of asyncGenerator(DB_COUNTS)) {
            const {DBContract} = await loadFixture(
                createDbContractsFixture()
            );
            dbContracts.push(DBContract);
        }
        const {Lottery, MockUSDT, VRFCoordinatorV2Mock, deployer,} = await loadFixture(
            createRandomNumberConsumerFixtureDeploy({
                dbContractAddresses: dbContracts.map(c => c.address),
                maxRowsCountEachDbContract: MAX_ITEMS_IN_DB
            })
        );

        for await (const i of asyncGenerator(DB_COUNTS)) {
            await dbContracts[i].setAllowedAddress(Lottery.address);
        }
        const players = await generatePlayers(PLAYERS_COUNT)(MockUSDT, deployer);

        for await (const i of asyncGenerator(PLAYERS_COUNT)) {
            const player = players[i];
            const playerWithProvider = player.connect(deployer.provider!);
            // @ts-ignore
            const lottery = await getContract("Lottery", Lottery.address, playerWithProvider)

            const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                Lottery.address,
                transferAmount,
                {gasLimit: 2100000}
            );
            await approveTx.wait();

            const tx = await lottery.buyTickets(transferAmount, {gasLimit: 15000000})
            await tx.wait();
            console.log("Buy tickets ", i)
        }

        const tx = await VRFCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address, {gasLimit: 25000000})

        await tx.wait();

        await new Promise(async (resolve, reject) => {
            Lottery.on("FullFillRandomWords", async (_, randomWords) => {
                for await (const i of asyncGenerator(randomWords.length)) {
                    try {
                        const maxAmount = (DB_COUNTS * MAX_ITEMS_IN_DB)
                        const luckyNumber = randomWords[i].mod(BigInt(maxAmount / MIN_DEPOSIT))
                        const currentContractIndex = luckyNumber.div(MAX_ITEMS_IN_DB);
                        const currentContract = dbContracts[currentContractIndex];
                        const currentUserIndex = luckyNumber.sub(currentContractIndex.mul(MAX_ITEMS_IN_DB))
                        const luckyPlayer = await currentContract.getWinnerByIndexAndCycle(currentUserIndex, 1);

                        const currentBalance = await MockUSDT.balanceOf(luckyPlayer)
                        console.log({luckyPlayer, currentBalance})
                        expect(currentBalance).to.equal(initialTransferAmount.sub(transferAmount).add(BigInt(getArguments().prizes[i])))
                    } catch (e) {
                        reject(e)
                    }
                }
                resolve("Success")
            })
        });

        await new Promise(res => setTimeout(() => res(null), 5000));

    }).timeout(604800000)
})