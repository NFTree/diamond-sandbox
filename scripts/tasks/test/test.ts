import "@nomiclabs/hardhat-ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { FacetCutAction, getSelectors } from "../../libraries/diamond";
import { verifyEtherscanUsingHardhat } from "../../../utils/etherscan";
interface AddFacetArgs {
    guardianaddr: string,
}

//Deploys our guardian via diamond standard
task("testSentinel", "Adds Sentinel Facet to a guardian module")
    .addParam("guardianaddr", "Guardian contract address to add function", undefined, types.string)
    .setAction(async (args: AddFacetArgs, hre: HardhatRuntimeEnvironment) => {
        const { ethers } = hre;

        const { guardianaddr } = args;

        const contract = await ethers.getContractAt('SentinelFacet', guardianaddr);
        let result = await contract.isAdmin("0x607dd6919b920309BF760376237C9b23A42979dA");
        console.log(result);
        result = await contract.isGuardian("0x607dd6919b920309BF760376237C9b23A42979dA");
        console.log(result);
        result = await contract.isAdmin("0xC4cd7e927fdcd71F78289a004B59FA727bd2165e");
        console.log(result);
        // result = await contract.DEFAULT_ADMIN_ROLE();
        // result = await contract.getRoleMemberCount("0x8b5b16d04624687fcf0d0228f19993c9157c1ed07b41d8d430fd9100eb099fe8");
        result = await contract.getRoleMemberCount("0x0000000000000000000000000000000000000000000000000000000000000000");
        // result = await contract.addGuardian("0x607dd6919b920309BF760376237C9b23A42979dA");
        console.log(result);
    });