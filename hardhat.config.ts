import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("hardhat-contract-sizer");
require("@nomicfoundation/hardhat-toolbox")


const config = {
    defaultNetwork: "mumbai", // TODO uncomment before deployment
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    etherscan: {
        url: "https://api.polygonscan.com/",
        apiKey: process.env.POLYGONSCAN_API_KEY,
    },
    networks: {
       /* hardhat: {
            loggingEnabled: true,
          //  blockGasLimit: Number.MAX_SAFE_INTEGER - 1,  // set a high block gas limit,
            accounts: {
                accountsBalance: "10000000000000000000000000000000000000"
            }
        },*/
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/fd8b36322657478f8798e81ffc6c5e0a`,
            accounts: [process.env.DEPLOYER_PRIVATE_KEY]
        },
    },
    mocha: {
        timeout: 60000 * 60
    }
};

export default config;
