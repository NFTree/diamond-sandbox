import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../libraries/diamond";

interface TaskArgs {
  facetname: string
}

//Deploys our facet contract
task("deployFacet", "Deploy facets")
.addParam("facetname", "Guardian contract address to add function", undefined, types.string)

.setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
  
    const [caller] = await ethers.getSigners();
    console.log("Using the account:", caller.address);

    console.log(`Deploying facet contract: ${args.facetname}`);

    //Deploy our facet contract
    const FacetContract = await ethers.getContractFactory(args.facetname);
    const facet = await FacetContract.deploy();
    await facet.deployed();
    console.log(`Deployed facet to ${facet.address}`);

    const selectors = getSelectors(facet);
    console.log(selectors.map(s => s));
  
    return facet.address;
  });
  
  export { };