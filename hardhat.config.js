
require("dotenv/config");
/* global ethers task */
require('@nomiclabs/hardhat-waffle')

const {
  RINKEBY_PRIVATE_KEY,
  ETHERSCAN_KEY,
} = process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.6',
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/fa64c332f51842a1af6e422630ebf1dc`,
      accounts: [RINKEBY_PRIVATE_KEY]
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
