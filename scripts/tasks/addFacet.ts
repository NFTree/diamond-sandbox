import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../libraries/diamond";

interface AddFacetArgs {
  guardianaddr: string, // The diamond contract
  facetname: string, // Contract name to deploy and add to our diamond
}

//This is an example on how to add a facet to a diamond
task("addFacet", "Deploy guardian module")
  .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
  .addParam("facetname", "Name of the facet to add", undefined, types.string)
  .setAction(async (args: AddFacetArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const [caller] = await ethers.getSigners();
    console.log("Using the account:", caller.address);

    console.log(`Deploying facet contract: ${args.facetname}`);

    //Deploy our facet contract
    const FacetContract = await ethers.getContractFactory(args.facetname);
    const facet = await FacetContract.deploy();
    await facet.deployed();
    console.log(`Deployed facet to ${facet.address}`);


    //Add facet to guardian
    console.log(`Adding facet to guardian`);
    const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', args.guardianaddr);
    const selectors = getSelectors(facet);
    let tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: selectors
      }],
      ethers.constants.AddressZero, '0x', { gasLimit: 800000 })

    let receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }

    console.log('Completed diamond cut upgrade')

    const contract = await ethers.getContractAt(args.facetname, args.guardianaddr);
    let result = await contract.function1();
    console.log(result)
    result = await contract.setValue(100);
    result = await contract.function1();
    console.log(result)
    
    return facet.address;
  });

export { };