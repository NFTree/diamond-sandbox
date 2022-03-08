import "@nomiclabs/hardhat-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;

  //1. Deploy guardian
  const guardianAddress =  await hre.run("deployGuardianModule");

  //2. Deploy safe with guardian
  const safeAddress = await hre.run("deploySafeTest", {name: "test"});

  //3. Add facet to guardian
  const facetAddress = await hre.run("addSentinelFacet", {guardianaddr: guardianAddress, adminaddr: safeAddress});
};

export default func;
func.id = "deploy_factory";
func.tags = ["AlbumFactory"];
