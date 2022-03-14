import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../../libraries/diamond";

interface TaskArgs {
    guardianaddr: string
    safe: string //module to add
}

//Deploys our guardian via diamond standard
task("updateTarget", "Deploy guardian module")
.addParam("guardianaddr", "Name for this safe", undefined, types.string)
.addParam("safe", "Name for this safe", undefined, types.string)
.setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
  
    const [caller] = await ethers.getSigners();
    console.log("Using the account:", caller.address);

    const guardian = await ethers.getContractAt("Guardian", args.guardianaddr);
    const result = await guardian.setTarget(args.safe);
    console.log(result);
  });
  
  export { };