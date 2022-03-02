import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../libraries/diamond";

interface AddFacetArgs {
  guardianaddr: string,
  facetname: string,
}

//Deploys our guardian via diamond standard
task("testDelegateCall", "Makes a call to the Guardian for a function")
  .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
  .addParam("facetname", "Name of the facet to add", undefined, types.string)
  .setAction(async (args: AddFacetArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;

    const [caller] = await ethers.getSigners();
    console.log("Using the account:", caller.address);

    const contract = await ethers.getContractAt(args.facetname, args.guardianaddr);
    let result = await contract.function1();
    console.log(result.toString())  
    result = await contract.getResponse();
    console.log(result)   
  });

export { };