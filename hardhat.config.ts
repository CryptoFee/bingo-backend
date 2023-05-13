import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const config = {
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
    hardhat: {
      loggingEnabled: true
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/v1/",
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  mocha: {
    timeout: 60000 * 60
  }
};

export default config;
