import {BigNumber, ethers} from "ethers";
import {getArgumentsFor} from "./getArgumentsFor";

export interface TestArguments {
    maxAmount: number
    prizes: BigNumber[]
    dbCount : number
    maxItemsInDB : number
    cycles : number
}
export const getArguments = () => {
    const maxPlayers = process.env.MAX_PLAYERS || "10"
    return getArgumentsFor(maxPlayers)
}
export const dollar = (amount: number) => ethers.utils.parseUnits(amount.toString(), 6);
export const AmountTooMuchForCurrentCycle = (power: number = 1) => [
    {
        amount: dollar(4 * power),
    },
    {
        amount: dollar(4 * power),
    },
    {
        amount: dollar(3 * power),
    }
]

export async function* asyncGenerator(count = 9) {
    let i = 0;
    while (i < count) {
        yield i++;
    }
}

export function splitArrayIntoChunks<T>(array: T[], chunkSize: number) {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        let chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}