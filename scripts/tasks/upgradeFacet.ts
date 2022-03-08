import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../libraries/diamond";

interface AddFacetArgs {
  guardianaddr: string,
  facetname: string,
  function: string
}

//Deploys our guardian via diamond standard
task("upgradeFacet", "Deploy guardian module")
  .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
  .addParam("facetname", "Name of the facet to add", undefined, types.string)
  .addParam("function", "function signature we want to replace", undefined, types.string, true)
  .setAction(async (args: AddFacetArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const [caller] = await ethers.getSigners();
    console.log("Using the account:", caller.address);

    console.log(`Deploying new facet contract: ${args.facetname}`);
    //Deploy our facet contract
    const FacetContract = await ethers.getContractFactory(args.facetname);
    const facet = await FacetContract.deploy();
    await facet.deployed();
    console.log(`Deployed facet to ${facet.address}`);


    //Add facet to guardian
    console.log(`Adding facet to guardian`);
    const diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', args.guardianaddr);
    
    let selectors;
    if(args.function) {
        //@ts-ignore
        selectors = getSelectors(facet).get([args.function]);
    }
    else {
        selectors = getSelectors(facet);
    }
    //@ts-ignore
    console.log(selectors.map(s=>s));
    let tx = await diamondCutFacet.diamondCut(
      [{
        facetAddress: facet.address,
        action: FacetCutAction.Replace,
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
    console.log(result.toString())
    result = await contract.setValue(100);
    result = await contract.function1();
    console.log(result.toString())
    
    return facet.address;
  });

export { };