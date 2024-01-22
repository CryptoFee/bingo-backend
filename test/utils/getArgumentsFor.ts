import { TestArguments} from "./helpers";
import {ethers} from "ethers";

export const dollar = (amount: number) => ethers.utils.parseUnits(amount.toString(), 6);

export const config = {
    "10": {
        maxAmount: 10,
        prizes: [dollar(2)],
        dbCount : 1,
        maxItemsInDB : 10,
        cycles: 1000
    },
    "100": {
        maxAmount: 100,
        prizes: [
            dollar(30),dollar(20),dollar(10)
        ],
        dbCount : 10,
        maxItemsInDB : 10,
        cycles: 1000
    },
    "1000": {
        maxAmount: 1000,
        prizes: [
            dollar(300),dollar(200),dollar(100)
        ],
        dbCount : 10,
        maxItemsInDB : 100,
        cycles: 100
    },
    "10000": {
        maxAmount: 10000,
        prizes:[dollar(3000),dollar(2000),dollar(1000)],
        dbCount : 10,
        maxItemsInDB : 1000,
        cycles: 10
    },
    "100000": {
        maxAmount: 100000,
        prizes: [dollar(30000),dollar(20000),dollar(10000)],
        dbCount : 100,
        maxItemsInDB : 1000,
        cycles: 10
    },
    "1000000": {
        maxAmount: 1000000,
        prizes: [dollar(300000),dollar(200000),dollar(100000)],
        dbCount : 1000,
        maxItemsInDB : 1000,
        cycles: 10
    }
}
export const getArgumentsFor = (maxPlayers: string): TestArguments => {
    return config[maxPlayers as keyof typeof config]
}