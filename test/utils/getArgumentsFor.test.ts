import {config} from "./getArgumentsFor";
import {expect} from "chai";


describe("Test Argument", async function () {
    it('Test all arguments db counts and cycle proper configuration', async () => {

            Object.keys(config).forEach((playersCount) => {

                const {
                    maxAmount, maxItemsInDB, cycles, dbCount,
                } = config[playersCount as keyof typeof config]

                expect(dbCount * maxItemsInDB).to.be.equal(Number(maxAmount))
                expect(cycles * maxItemsInDB).to.be.equal(10000)
            })
    })
})