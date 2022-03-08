import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Test1Args {
    guardianaddr: string,
}

// This makes the call to the guardian contract
task("testSentinelViaGuardian", "Calls the guardian contract to get number of admins")
    .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
    .setAction(async (args: Test1Args, hre: HardhatRuntimeEnvironment) => {
        console.log('Start testSentinelViaGuardian')
        const { ethers } = hre;

        const { guardianaddr } = args;

        //We point to SentinelFacet to get ABI data but the contract call is to the Guardian/diamond
        const contract = await ethers.getContractAt('SentinelFacet', guardianaddr);

        //Get number of addresses assigned to admin role
        console.log(`Sending getRoleMemberCount() for admin role to ${guardianaddr}`);
        let result = await contract.getRoleMemberCount("0x0000000000000000000000000000000000000000000000000000000000000000");
        console.log(`Number of admins assigned: ${result.toString()}`);
    });

interface Test2Args {
    facetaddr: string,
}
// This makes the call to the facet contract
task("testSentinelViaFacet", "Calls the facet contract directly to get number of admins")
    .addParam("facetaddr", "Guardian contract address to add function", undefined, types.string)
    .setAction(async (args: Test2Args, hre: HardhatRuntimeEnvironment) => {
        console.log('Start testSentinelViaFacet')
        const { ethers } = hre;

        const { facetaddr } = args;

        //This points to the facet contract directly
        const contract = await ethers.getContractAt('SentinelFacet', facetaddr);

        //Get number of addresses assigned to admin role
        console.log(`Sending getRoleMemberCount() for admin role to ${facetaddr}`);
        let result = await contract.getRoleMemberCount("0x0000000000000000000000000000000000000000000000000000000000000000");
        console.log(`Number of admins assigned: ${result.toString()}`);

    });