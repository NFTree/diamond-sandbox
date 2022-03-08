import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getFallbackHandlerDeployment, getProxyFactoryDeployment, getSafeSingletonDeployment } from "@gnosis.pm/safe-deployments";

interface TaskArgs {
    name: string
    moduleaddress: string
}

//Deploys a gnosis safe
task("deploySafeTest", "Creates a gnosis safe wallet")
    .addParam("name", "Name for this safe", undefined, types.string)
    .setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;
        const [caller] = await ethers.getSigners();

        console.log("Deploying SafeFactory...")
        const SafeFactory = await ethers.getContractFactory('SafeFactory')
        const safeFactory = await SafeFactory.deploy(
            getFallbackHandlerDeployment()?.networkAddresses["4"],
            getProxyFactoryDeployment()?.networkAddresses["4"],
            getSafeSingletonDeployment()?.networkAddresses["4"]
        )
        await safeFactory.deployed()
        console.log('SafeFactory deployed:', safeFactory.address)

        const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string", "address[]"], [args.name, [caller.address]]));
        console.log("Creating safe")
        const safeTxn = await safeFactory.createSafe(salt);
        let safeReceipt = await safeTxn.wait();
        if (!safeReceipt.status) {
            throw Error(`Gnosis safe create failed: ${safeTxn.hash}`)
        }

        console.log(`Finish creating gnosis safe ${safeReceipt.events[2].address}`)
        return safeReceipt.events[2].address;
    });