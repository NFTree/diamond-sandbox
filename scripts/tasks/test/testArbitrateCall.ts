import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Test2Args {
    guardianaddr: string,
}
// Run this to make a call to the Arbitrate Facet
// This test calls a erc721 mint function hosted on rinkeby
// Check the following link after running and there should be a new ERC721 added after success of this test
// https://testnets.opensea.io/0x441dc5a925f5c6cc3ce5db19855ed370fa6f6657?tab=activity
task("testArbitrateCall", "Sends a call to an arbitrary contract")
    .addParam("guardianaddr", "Guardian contract address", undefined, types.string)
    .setAction(async (args: Test2Args, hre: HardhatRuntimeEnvironment) => {
        console.log('Start testArbitrateCall')
        const { ethers } = hre;

        const { guardianaddr } = args;

        // We pass the contract name ArbitrateFacet to retrieve the ABI
        // but we should call the function through the Guardian address
        const contract = await ethers.getContractAt('ArbitrateFacet', guardianaddr);

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
// Generated at https://abi.hashex.org/
// function: mintNFor
// params: numMint = 1, Address = 0x441Dc5A925f5c6CC3Ce5db19855Ed370FA6F6657
const callData = "0x415759570000000000000000000000000000000000000000000000000000000000000001000000000000000000000000441dc5a925f5c6cc3ce5db19855ed370fa6f6657";
export { };