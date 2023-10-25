import {generatePlayers, initialTransferAmount} from "./utils/createRandomPlayerWithUSDT";
import {createRandomNumberConsumerFixtureDeploy} from "./utils/deployRandomNumberConsumerFixture.new";
import {asyncGenerator, dollar, getArguments} from "./utils/helpers";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {expect} from "chai"
import {BigNumber} from "ethers";
import {getContract} from "../scripts/helpers/getContract";
import {createDbContractsFixture} from "./utils/deployDbContractsFixture";

const transferAmount = dollar(1)

const DB_COUNTS = 10;
const MAX_ITEMS_IN_DB = 100;
const PLAYERS_COUNT = 1000;

describe("Lottery unit tests with full implementation", async () => {
    it.only("Should successfully add multiple players with each 1$ And Check for winners balances", async () => {
        const dbContracts = [];
        // generating 10 contracts and storing them
        for await (const i of asyncGenerator(DB_COUNTS)) {
            const { DBContract} = await loadFixture(
                createDbContractsFixture()
            );
            dbContracts.push(DBContract);
        }
        const { Lottery, MockUSDT, VRFCoordinatorV2Mock, deployer,  } = await loadFixture(
            createRandomNumberConsumerFixtureDeploy({ dbContractAddresses: dbContracts.map(c => c.address), maxRowsCountEachDbContract: MAX_ITEMS_IN_DB })
        );
        for await (const i of asyncGenerator(DB_COUNTS)) {
            await dbContracts[i].setAllowedAddress(Lottery.address);
        }
        const players = await generatePlayers(PLAYERS_COUNT)(MockUSDT, deployer,);
        for await (const i of asyncGenerator(PLAYERS_COUNT)) {
            const player = players[i];
            const playerWithProvider = player.connect(deployer.provider!);
            // @ts-ignore
            const lottery = await getContract("Lottery", Lottery.address, playerWithProvider)
            const approveTx = await MockUSDT.connect(playerWithProvider).approve(
                Lottery.address,
                transferAmount,
            );
            await approveTx.wait();
            const tx = await lottery.buyTickets(transferAmount, {gasLimit: 300000})
            await tx.wait();
            console.log("Buy tickets ", i)
        }
        await VRFCoordinatorV2Mock.fulfillRandomWords(1, Lottery.address, {gasLimit: 2500000})
        const playersCountByDbs: { [key: string]: BigNumber } = {};
        for await (const i of asyncGenerator(DB_COUNTS)) {
            playersCountByDbs[dbContracts[i].address] = await dbContracts[i].getPlayersCount(1)
        }
        console.log(playersCountByDbs, 'playersCountByDbs');
    })
})