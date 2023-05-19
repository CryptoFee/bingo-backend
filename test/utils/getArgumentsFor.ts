import {TestArguments} from "./helpers";

export const getArgumentsFor = (maxPlayers: string): TestArguments => {
    const config = {
        "10": {
            maxAmount: 10,
            prizes: [3, 2, 1].map(v => v * 1000000),
            cycles: 1
        },
        "100": {
            maxAmount: 1000,
            prizes: [
                1,1,1,1,1,1,1,1,1,1,
                1,1,1,1,1,1,1,1,1,1,
                1,1,1,1,1,1,1,1,1,1,
                1,1,1,1,1,1,1,1,1,1,
            ].map(v => v * 1000000), // 10 winners
            cycles:1
        }
    }

    return config[maxPlayers as keyof typeof config]
}