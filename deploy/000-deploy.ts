import "@nomiclabs/hardhat-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;

  //1. Deploy guardian
  const guardianAddress =  await hre.run("deployGuardianModule");

  //2. Deploy safe with guardian
  const safeAddress = await hre.run("deploySafe", {name: "test"});

  //3. Add facet to guardian
  const facetAddress = await hre.run("addSentinelFacet", {guardianaddr: guardianAddress, adminaddr: safeAddress});

  //4. run some tests on our deployed guardian/facet
  await hre.run("testSentinelViaGuardian", {guardianaddr: guardianAddress});
};

export default func;
func.id = "deploy_factory";
func.tags = ["AlbumFactory"];
