import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getFallbackHandlerDeployment, getProxyFactoryDeployment, getSafeSingletonDeployment } from "@gnosis.pm/safe-deployments";

interface TaskArgs {
    factory: string //safe factory contract address
    name: string // name of our safe
    moduleaddress: string //module to add
}

//Deploys a gnosis safe
task("createSafe", "Creates a gnosis safe wallet")
    .addParam("factory", "Factory contract address that will deploy our safe", undefined, types.string)
    .addParam("name", "Name for this safe", undefined, types.string)
    .addParam("moduleaddress", "Module to enable on this safe", undefined, types.string)
    .setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;
        const [caller] = await ethers.getSigners();

        const {factory, name, moduleaddress} = args;

        // 1) get safe factory
        const safeFactory = await ethers.getContractAt('SafeFactory', factory);
        console.log(`Using safe factory ${safeFactory.address}`);

        console.log('');
        console.log("Creating safe");
        const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["string", "address[]"], [name, [caller.address]]));
        const safeTxn = await safeFactory.createSafe(salt, moduleaddress);
        let safeReceipt = await safeTxn.wait();
        if (!safeReceipt.status) {
            throw Error(`Gnosis safe create failed: ${safeTxn.hash}`)
        }

        console.log('');
        console.log(`Finish creating gnosis safe ${safeReceipt.events[1].address}`)
        return safeReceipt.events[1].address;
    });