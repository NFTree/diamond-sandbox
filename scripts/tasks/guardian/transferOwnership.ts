import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../../libraries/diamond";

interface TaskArgs {
    guardianaddr: string
    safe: string //address of the safe
}

// Sets new owner to our module to only the safe
task("transferOwnership", "Deploy guardian module")
    .addParam("guardianaddr", "The guardian contract", undefined, types.string)
    .addParam("safe", "Safe address that will own this guardian module", undefined, types.string)
    .setAction(async (args: TaskArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;

        const { safe, guardianaddr } = args;

        const guardian = await ethers.getContractAt('OwnershipFacet', guardianaddr);

        let tx
        let receipt
        // call to init function
        tx = await guardian.transferOwnership(safe);
        console.log('Diamond cut tx: ', tx.hash)
        receipt = await tx.wait()
        if (!receipt.status) {
            throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }

        console.log('')
        console.log(`Transferred ownership of guardian at ${guardian.address} to ${safe}`);
        console.log(`to safe ${safe}`);
    });

export { };