import {createDbContractsFixture} from "./utils/deployDbContractsFixture";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers"
import {expect} from "chai"
import {asyncGenerator} from "./utils/helpers";
describe("Testing setAllowedAddress", async () => {
    it.only("Should pass first time and give error for the second case", async () => {
        const { DBContract, deployer} = await loadFixture(
            createDbContractsFixture()
        );
        await DBContract.setAllowedAddress(deployer.address);
        expect(deployer.address).to.equal(await DBContract._allowedAddress());
        await expect(DBContract.setAllowedAddress('0x0000000000000000000000000000000000000000'))
            .to
            .be
            .revertedWith("Allowed address already set");
    });
});

describe("Testing setPlayerByCycle and getPlayersCount", async () => {
    it.only("Should setPlayers and get players count", async () => {
        const { DBContract, deployer} = await loadFixture(
            createDbContractsFixture()
        );
        await DBContract.setAllowedAddress(deployer.address);
        await DBContract.setPlayerByCycle(0, '0x0000000000000000000000000000000000000000');
        expect(await DBContract.getPlayersCount(0))
            .to
            .equal(1);
    });
});

describe("Testing getWinnerByIndexAndCycle", async () => {
    it.only("Should return winner address", async () => {

        const { DBContract, deployer} = await loadFixture(
            createDbContractsFixture()
        );
        await DBContract.setAllowedAddress(deployer.address);
        for await (const i of asyncGenerator()) {
            await DBContract.setPlayerByCycle(0, `0x000000000000000000000000000000000000000${i}`);
        }
        expect(await DBContract.getWinnerByIndexAndCycle(5, 0))
            .to
            .equal('0x0000000000000000000000000000000000000005');
    });
});