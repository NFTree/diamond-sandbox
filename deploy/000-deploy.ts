import "@nomiclabs/hardhat-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers } = hre;
  const [caller] = await ethers.getSigners();

  const SAFE_NAME = "test";

  console.log('STARTING DEPLOY');

  // 1. deploy safe factory
  console.log('');
  const safeFactoryAddress = await hre.run("deploySafeFactory");

  // 2. predict address of safe to be deployed
  // This is supplied to the guardian module
  console.log('');
  console.log('Predicting safe address...');
  const safeFactory = await ethers.getContractAt("SafeFactory", safeFactoryAddress);
  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string", "address[]"], [SAFE_NAME, [caller.address]]));
  const predictedSafeAddress = await safeFactory.predictSafeAddress(salt);
  console.log(`predicted safe address: ${predictedSafeAddress}`);
  
  // 3. deploy guardian
  console.log('');
  const guardianAddress = await hre.run("deployGuardianModule", {safe: predictedSafeAddress});

  // 4. create safe
  console.log('');
  const safeAddress = await hre.run("createSafe", {factory: safeFactoryAddress, name: SAFE_NAME, moduleaddress: guardianAddress});
  console.log(`safe deployed at: ${safeAddress}`)

  //5. Add facet to guardian
  console.log('');
  const facetAddress = await hre.run("addSentinelFacet", { guardianaddr: guardianAddress, adminaddr: safeAddress });

  //6. Add facet to guardian
  console.log('');
  const arbitrateAddress = await hre.run("addArbitrateFacet", { guardianaddr: guardianAddress });

  console.log('');
  console.log(`guardian: ${guardianAddress}`);
  console.log(`safe: ${safeAddress}`);
};

export default func;
func.id = "deploy_factory";
func.tags = ["AlbumFactory"];
