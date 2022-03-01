/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')
// npx hardhat run scripts/deploy.js --network rinkeby

//Update this to our diamond deploy!
const DIAMOND_ADDR = "0x3753D7f8d4EF8bec5a27110814D553C923e500Da";

async function upgradeFacet() {
  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]

  //We hit the interface of InitialFacet but it is hosted at the Diamond contract addr
  const InitialFacet = await ethers.getContractAt('InitialFacet', DIAMOND_ADDR);
  console.log('Calling initial function1()...')
  result = await InitialFacet.function1();
  console.log(result);
  console.log('Calling initial function2()...')
  result = await InitialFacet.function2();
  console.log(result);

  console.log('Upgrading function1() and function2()...')
  //Deploy our new contracts with updated functions
  const UpgradeFacet = await ethers.getContractFactory('UpgradeFacet')
  const upgradeFacet = await UpgradeFacet.deploy()
  await upgradeFacet.deployed()
  console.log('UpgradeFacet deployed:', upgradeFacet.address)

  console.log('Upgrading function1() and function2() on diamond...')
  //Get our dianond facet and push upgrade
  const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', DIAMOND_ADDR);
  const selectors = getSelectors(upgradeFacet);
  tx = await diamondCutFacet.diamondCut(
    [{
      facetAddress: upgradeFacet.address,
      action: FacetCutAction.Replace,
      functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })

  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }

  console.log('Done upgrading function1() and function2()!')
  console.log('Calling initial function1()...')
  result = await InitialFacet.function1();
  console.log(result);
  console.log('Calling initial function2()...')
  result = await InitialFacet.function2();
  console.log(result);

  console.log('Completed diamond cut upgrade')
  return upgradeFacet.address
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  upgradeFacet()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.upgradeFacet = upgradeFacet
