import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getFallbackHandlerDeployment, getProxyFactoryDeployment, getSafeSingletonDeployment } from "@gnosis.pm/safe-deployments";

//Deploys a gnosis safe
task("deploySafeFactory", "Deploy the gnosis safe factory")
    .setAction(async (_, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;
        const [caller] = await ethers.getSigners();

        // 1) Deploy our safe factory to deploy/initialize safes
        console.log("Deploying SafeFactory...")
        const SafeFactory = await ethers.getContractFactory('SafeFactory')
        const safeFactory = await SafeFactory.deploy(
            getFallbackHandlerDeployment()?.networkAddresses["4"],
            getProxyFactoryDeployment()?.networkAddresses["4"],
            getSafeSingletonDeployment()?.networkAddresses["4"]
        )
        await safeFactory.deployed()
        console.log('SafeFactory deployed:', safeFactory.address)

        return safeFactory.address;
    });