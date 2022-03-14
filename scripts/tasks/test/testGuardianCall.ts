import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Test2Args {
    guardianaddr: string,
}
// This makes the call to the facet contract
task("testGuardianCall", "Sends a call to an arbitrary contract")
    .addParam("guardianaddr", "Guardian contract address", undefined, types.string)
    .setAction(async (args: Test2Args, hre: HardhatRuntimeEnvironment) => {
        console.log('Start testGuardianCall')
        const { ethers } = hre;

        const { guardianaddr } = args;

        //This points to the facet contract directly
        const contract = await ethers.getContractAt('ArbitrateFacet', guardianaddr);

        const iface = new ethers.utils.Interface(ABI);
        let tx = await contract.doCall(CONTRACT_ADDRESS, callData);

        let receipt = await tx.wait();
        if (!receipt.status) {
            throw Error(`Call failed`)
        }

        console.log('Finished call')
    });

// Hardcoded contract data
const CONTRACT_ADDRESS = "0xfa50421dAb8fA1510a4d22CaC5Aa92f9b364f345";
const ABI = [{ "inputs": [{ "internalType": "uint256", "name": "numMint", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }], "name": "mintNFor", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
const callData = "0x415759570000000000000000000000000000000000000000000000000000000000000001000000000000000000000000441dc5a925f5c6cc3ce5db19855ed370fa6f6657";
export { };