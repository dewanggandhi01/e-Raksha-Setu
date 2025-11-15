require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { LOCALHOST_RPC, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20"
      }
    ]
  },
  paths: {
    sources: "./src/contracts"
  },
  networks: {
    hardhat: {},
    localhost: {
      url: LOCALHOST_RPC || "http://127.0.0.1:8545"
    },
    // add other networks here and set RPC and PRIVATE_KEY in .env
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};
