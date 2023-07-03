require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const PK = process.env.PK || ""
const RPC_URL = process.env.RPC_URL || ""

module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    goerli: {
      url: RPC_URL,
      accounts: [PK],
      chainId: 5
    }
  },
  solidity: "0.8.18"
};