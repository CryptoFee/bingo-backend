import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-contract-sizer");
require("@nomicfoundation/hardhat-toolbox")


const config = {
    defaultNetwork: "hardhat", // TODO uncomment before deployment
    solidity: {
        compilers: [
            {
                version: '0.8.20',
                settings: {
                    evmVersion: 'paris'
                }
            }
        ]
    },
    etherscan: {
        url: "https://api.polygonscan.com/",
        apiKey: process.env.POLYGONSCAN_API_KEY,
    },
    networks: {
        hardhat: {
            loggingEnabled: true,
            gas : Number.MAX_SAFE_INTEGER - 5,
            blockGasLimit: Number.MAX_SAFE_INTEGER - 1,  // set a high block gas limit,
            accounts: {
                accountsBalance: "10000000000000000000000000000000000000"
            }
        },

        /* mumbai: {
             url: `https://polygon-mumbai.infura.io/v3/fd8b36322657478f8798e81ffc6c5e0a`,
             accounts: [process.env.DEPLOYER_PRIVATE_KEY]
         },*/
        /* polygonMainNet: {
             url: `https://polygon-mainnet.infura.io/v3/fd8b36322657478f8798e81ffc6c5e0a`,
             accounts: [process.env.DEPLOYER_PRIVATE_KEY]
         },*/
    },
    mocha: {
        timeout: 60000 * 60 * 24 * 7
    }
};

export default config;
