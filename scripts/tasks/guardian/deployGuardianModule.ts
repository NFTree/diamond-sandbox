import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../../libraries/diamond";

interface TaskArgs {
  safe: string //address of the safe
}

//Deploys our guardian via diamond standard
task("deployGuardianModule", "Deploy guardian module")
  .addParam("safe", "Safe address that will own this guardian module", undefined, types.string)
  .setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const [caller] = await ethers.getSigners();


    const { safe } = args;

    // 1) deploy DiamondCutFacet
    // This exposes functions to add/update/remove functions on our diamond
    console.log('')
    console.log("Deploying DiamondCutFacet...")
    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
    const diamondCutFacet = await DiamondCutFacet.deploy()
    await diamondCutFacet.deployed()
    console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

    // 2) deploy Guardian module/diamond contract
    console.log('')
    console.log(`Deploying guardian module...`);
    console.log(`Owner of guardian: ${safe}`)
    const Guardian = await ethers.getContractFactory('Guardian');
    const guardian = await Guardian.deploy(caller.address, diamondCutFacet.address, safe);
    await guardian.deployed()
    console.log('Module deployed:', guardian.address)

    // 3) deploy DiamondInit -- boilerplate
    // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
    // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
    console.log('')
    console.log('Deploying DiamondInit...')
    const DiamondInit = await ethers.getContractFactory('DiamondInit')
    const diamondInit = await DiamondInit.deploy()
    await diamondInit.deployed()
    console.log('DiamondInit deployed:', diamondInit.address)

    // 4) deploy facets
    // Deploy some facets we need to add to our diamond
    console.log('')
    console.log('Deploying facets')
    const FacetNames = [
      'DiamondLoupeFacet', // Exposes how to read/list function/facet data added to this diamond
      'OwnershipFacet', // Handles ownership stuff
    ]
    const cut = []
    for (const FacetName of FacetNames) {
      const Facet = await ethers.getContractFactory(FacetName)
      const facet = await Facet.deploy()
      await facet.deployed()
      console.log(`${FacetName} deployed: ${facet.address}`)
      cut.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facet)
      })
    }

    // upgrade diamond with facets
    console.log('')
    console.log('Diamond Cut:', cut)
    const diamondCut = await ethers.getContractAt('IDiamondCut', guardian.address)
    let tx
    let receipt
    // call to init function
    let functionCall = diamondInit.interface.encodeFunctionData('init')
    tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
    console.log('Diamond cut tx: ', tx.hash)
    receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }

    console.log('')
    console.log('Completed diamond cut')

    console.log('')
    console.log(`Guardian deployed at: ${guardian.address}`)
    return guardian.address;
  });

export { };