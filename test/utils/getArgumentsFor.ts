import {dollar, TestArguments} from "./helpers";

export const getArgumentsFor = (maxPlayers: string): TestArguments => {
    const config = {
        "10": {
            maxAmount: 10,
            prizes: [3, 2, 1].map(v => v * 1000000),
            cycles: 1
        },
        "100": {
            maxAmount: 10,
            prizes: [
               /* 300000,
                200000,
                100000,
                50000,
                25000,
                10000,
                5000,
                2500,
                1000,
                500,*/
                1,1,1
            ].map(v => v * 1000000), // 10 winners
            cycles: 1
        }
    }

    return config[maxPlayers as keyof typeof config]
}