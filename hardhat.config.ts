
import "hardhat-deploy";
import "dotenv/config";
/* global ethers task */
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import '@nomiclabs/hardhat-waffle';
import "./scripts/tasks";

const {
  RINKEBY_PRIVATE_KEY,
  ETHERSCAN_KEY,
} = process.env;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: '0.8.11',
  defaultNetwork: 'rinkeby',
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/fa64c332f51842a1af6e422630ebf1dc`,
      accounts: [RINKEBY_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_KEY
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
